var express = require('express')
const pool = require('../utils/sqlPool')
const { getTime } = require('../utils/Time')

const { AuthUse } = require('../utils/jwt')

var appointRouter = express.Router();

appointRouter.get('/', new AuthUse(1).w, async (req, res, next) => {
    const { year, month, date, room } = req.query;
    const select = 'SELECT id, status FROM appointment WHERE year = ? AND month = ? AND date = ? AND room = ?';
    const selectParam = [JSON.parse(year), JSON.parse(month), JSON.parse(date), room];
    pool.sqlQuery(select, selectParam, function(err, result){
      if(err){
        res.status(500).json('服务器错误')
        console.log('查询数据失败');
      }else{
        if(result.length >0){
          res.json({
            id: result[0].id,
            status: result[0].status,
          });
        }else{
          let status = new Array(28).fill(0);
          status = JSON.stringify(status);
          const addtime = getTime('date_time');
          const add = 'INSERT INTO appointment(room, year, month, date, status, created_at, updated_at) value(?, ?, ?, ?, ?, ?, ?)';
          const addParam = [room, JSON.parse(year), JSON.parse(month), JSON.parse(date), status, addtime, addtime];
          pool.sqlQuery(add, addParam, function(err, result){
            if(err){
              console.log('添加数据失败');
            }else{
              console.log('添加数据成功');
              res.json({
                id: result.insertId,
                status: status,
              });
            }
          });
        }
      }
    });
})

appointRouter.post('/update', new AuthUse(1).w, async (req, res, next) => {
  const { headers, body } = req;
  const { id, room, selectIndex, reasonValue } = body;
  const updatetime = getTime('date_time');
  pool.getConnection((err, connection) => {
    if(err){
      console.log('预约建立连接失败' + err);
      res.status(500).JSON('预约失败');
      connection.release();
    }
    // 开始执行预约事务
		connection.beginTransaction((beginErr) => {
		  if (beginErr) {
        console.log('预约事务开始失败' + err)
        res.status(500).JSON('预约失败');
        connection.rollback(function (err) {
          if(err){
            console.log("预约事务回滚失败：" + err);
          }
          connection.release();
        });
		  }
      const select = 'SELECT status FROM appointment WHERE id = ? FOR UPDATE';
      const selectParam = [JSON.parse(id)];
      let appoint = new Promise((resolve, reject) => {
        connection.query(select, selectParam, (sqlErr, result) => {
          if (sqlErr) {
            reject(sqlErr);
          }else{
            let status = JSON.parse(result[0].status);
            let index = JSON.parse(selectIndex);
            for(let i = 0; i < index.length; i++){
              if(status[index[i]] === 0){
                status[index[i]] = 1;
              }else{
                reject('时间段已被预约');
                connection.rollback(function (err) {
                  if (err) console.log("预约事务回滚失败：" + err);
                  connection.release();
                });
              }
            }
            const update = [`UPDATE appointment SET status = ?, updated_at = ? WHERE id = ?`,
                            `INSERT INTO appointDetail(uid, room, appoint_id, selectIndex, result, created_at) value(?, ?, ?, ?, ?, ?)`];
            const updateParams = [[JSON.stringify(status), updatetime, JSON.parse(id)],
                                  [headers.uid, room, JSON.parse(id), selectIndex, reasonValue, updatetime]];
            let updateArr = update.map((sql, index) => {
              return new Promise((sqlResolve, sqlReject) => {
                const data = updateParams[index];
                connection.query(sql, data, (sqlErr, result) => {
                  if (sqlErr) {
                  sqlReject(sqlErr);
                  }
                  sqlResolve(result);
                });
              });
            });
            Promise.all(updateArr).then(() => {
              // 提交事务
              connection.commit(function (commitErr) {
              if (commitErr) {
                console.log("预约提交事务失败:" + commitErr);
                res.status(500).json('预约失败');
                connection.rollback(function (err) {
                  if(err){
                    console.log("预约事务回滚失败：" + err);
                  }
                connection.release();
                });
              }
              res.status(200).json('预约成功');
              connection.release();
              });
            }).catch((error) => {
              // 多条sql语句执行中 其中有一条报错 直接回滚
              res.status(500).json('预约失败');
              connection.rollback(function () {
                console.log("sql运行失败: " + error);
                connection.release();
              });
            })
          }
        })
      })
      appoint.catch((error) => {
        res.status(500).json('预约失败');
      })
    })
  })
})

appointRouter.post('/detail', new AuthUse(1).w, async (req, res, next) => {
    const { user, body } = req;
    const { year, month, date, selectTime, result} = body;
    const addtime = getTime('date_time');
    let promise = await mysql.set('appointDetail', {
        year: year,
        month: month,
        date: date,
        selectTime: selectTime,
        result: result,
        uid: user.id,
        addtime: addtime,
    });
    res.json(promise);
})

module.exports =  appointRouter ;