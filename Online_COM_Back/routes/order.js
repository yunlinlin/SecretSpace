var express = require('express')
// const { mysql } = require('access-db')
const pool = require('../utils/sqlPool')
const { getTime } = require('../utils/Time')

const { AuthUse } = require('../utils/jwt')

var orderRouter = express.Router();

orderRouter.get('/', new AuthUse(1).w, async (req, res, next) => {
    const { year, month, date } = req.query;
    const select = 'SELECT * FROM appointment WHERE year = ? AND month = ? AND date = ? ';
    const selectParam = [year, month, date];
    try{
        pool.sqlQuery(select, selectParam, function(err, result){
          if(err){
            console.log('查询数据失败');
          }else{
            console.log('查询数据成功');
              res.json(result);
          }
        });
    }catch(err){
        res.status(500).send('网络错误!');
    }
    // let list = (await mysql.find('appointment', {
    //     p0:['year', '=', parseInt(year)],
    //     p1:['month', '=', parseInt(month)],
    //     p2:['date', '=', parseInt(date)],
    //     r: 'p0 && p1 && p2',
    // })).data.objects;
    // res.json(list)
})

orderRouter.post('/add', new AuthUse(1).w, async (req, res, next) => {
    const { year, month, date, selected } = req.body;
    const addtime = getTime('date_time');
    const add = 'INSERT INTO appointment(year, month, date, status, addtime) value( ?, ?, ?, ?, ?) ';
    const addParam = [year, month, date, selected, addtime];
    try{
        pool.sqlQuery(add, addParam, function(err, result){
          if(err){
            console.log('查询数据失败');
          }else{
            console.log('查询数据成功');
              res.json(result);
          }
        });
    }catch(err){
        res.status(500).send('网络错误!');
    }
    // let newRecord = await mysql.set('appointment', {
    //     year: year,
    //     month: month,
    //     date: date,
    //     status: selected,
    //     addtime: addtime,
    // });
    // res.json(newRecord);
})

orderRouter.post('/update', new AuthUse(1).w, async (req, res, next) => {
    const { year, month, date, selected, id } = req.body;
    const updatetime = getTime('date_time');
    await mysql.update('appointment', id, {
        year: year,
        month: month,
        date: date,
        status: selected,
        updatetime: updatetime,
    })
    res.json({
        message: 'success',
    })
})

orderRouter.post('/detail', new AuthUse(1).w, async (req, res, next) => {
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

module.exports =  orderRouter ;