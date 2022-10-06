const express = require('express')
const pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt')
const { genToken } = require('../utils/jwt')

let loginRouter = express.Router()

loginRouter.post('/', new AuthUse(1).w, async function(req, res,next){
  res.json({
    message: 'success!',
  })
})

loginRouter.post('/loginCheck', async function(req, res, next){
  let { uid, password } = req.body;
  const select = 'SELECT * from users WHERE uid = ? ';
  const selectParam = [uid];
  pool.sqlQuery(select, selectParam, function(err, result){
    if(err){
      console.log('查询数据失败');
    }else{
      console.log('查询数据成功');
      if(result.length !== 0){
        if(result[0].password === password){
          res.json({
            token: genToken(result[0].uid, result[0].level),
            uid: result[0].uid,
            level: result[0].level,
            nickName: result[0].nickname,
            message: '登录成功'
          })
        }else{
          res.json({
            message: '密码错误',
          });
        }
      }else{
        res.json({
          message: '用户不存在',
        });
      }
    }
  });
})

loginRouter.post('/admin', new AuthUse(1).w, async function(req, res, next){
  const { secretKey } = req.body;
  const uid = req.headers.uid;
  const select = 'SELECT * from admin WHERE uid = ? OR secretKey = ? ';
  const selectParam = [uid, secretKey];
  pool.sqlQuery(select, selectParam, function(err, result){
    if(err){
      console.log('查询数据失败');
    }else{
      console.log('查询数据成功');
      if(result.length !== 0){
        const update = 'UPDATE users SET level = ? WHERE uid = ? '
        const updateParams = [result[0].level, uid];
        pool.sqlQuery(update, updateParams, function(err, result){
          if(err){
            console.log('更新数据失败');
          }else{
            console.log('更新数据成功');
          }
        });
        res.json({
          token: genToken(uid, result[0].level),
          level: result[0].level,
          uid: uid,
          message: '更新成功',
        })
      }
    }
  });
})

module.exports = loginRouter