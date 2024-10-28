const express = require('express');
let pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt');
const nodemailer = require('nodemailer');
const { getTime } = require('../utils/Time');
const { genToken } = require('../utils/jwt');
let usersRouter = express.Router();

/* Users regist and login. */
usersRouter.post('/isLogin', new AuthUse(1).w, (req, res, next) => {
  res.status(200).send('登录成功');
});

usersRouter.get('/unique', async (req, res, next) => {
  let { uid, address } = req.query;
  if(uid){
    uid = JSON.parse(uid);
  }
  const select = 'SELECT * from users WHERE uid = ? OR email = ? ';
  const selectParam = [uid, address];
  try{
    pool.sqlQuery(select, selectParam, function(err, result){
      if(err){
        console.log(err);
        res.status(500).send('查询错误!');
      }else{
        res.status(200).json(result);
      }
    })
  }catch(err){
    res.status(500).send('查询错误!');
  }
});

usersRouter.post('/sendEmail', async (req, res, next) => {
  const { code, email } = req.body;
  let transporter = nodemailer.createTransport({
    service: "QQ",
    host: 'smtp.qq.com',
    port: 25,
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_SMTP, // generated ethereal password
    },
  });
  const mailContent = {
    from: process.env.EMAIL_USER, // 发送者
    to: email, // 接受者,可以同时发送多个,以逗号隔开
    subject: '验证码', // 标题
    text: '验证码：' + code + ', 本次验证码有效期为5分钟', // 文本
  };
  transporter.sendMail(mailContent, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('发送成功');
    res.status(200);
  })
})

usersRouter.post('/addInfo', async (req, res, next) => {
  const {uid, name, nickName, phoneNum, password, email} = req.body;
  let nowTime = getTime('date_time');
  avatarURL = '/defaultFigure.jpg'
  const addSql = 'INSERT INTO users(uid, name, avatar, nickname, phone, password, email, created_at, updated_at, level) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const addSqlParams = [JSON.parse(uid), name, avatarURL, nickName.length > 0 ? nickName : name, JSON.parse(phoneNum), password, email, nowTime, nowTime, 1];
  try{
    pool.sqlQuery(addSql, addSqlParams, function(err, result){
      if(err){
        console.log(err);
        res.status(500).json('服务器错误!');
      }else{
        console.log('添加数据成功');
        res.json({
          data: {
            token: genToken(uid, 1),
            uid: uid,
            avatar: '/defaultFigure.jpg',
            nickname: name,
          },
          message : '注册成功',
        })
      }
    })
  }catch(err){
    res.status(500).send('服务器错误!');
  }
})

usersRouter.get('/getInfo', new AuthUse(1).w, async (req, res, next) => {
  const uid = req.headers.uid;
  const select = 'SELECT * from users WHERE uid = ? ';
  const selectParam = [uid];
  try{
    pool.sqlQuery(select, selectParam, function(err, result){
      if(err){
        console.log('查询数据失败');
      }else{
        console.log('查询数据成功');
        if(result.length !== 0){
          res.json({
            name: result[0].name,
            message : '查询成功',
          })
        }
      }
    });
  }catch(err){
    res.status(500).send('网络错误!');
  }
})

usersRouter.post('/loginCheck', async function(req, res, next){
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
            avatar: result[0].avatar,
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

usersRouter.post('/passwordReset', async (req, res, next) => {
  const { email, password } = req.body;
  let nowTime = getTime('date_time');
  const update = 'UPDATE users SET password = ?, updated_at = ? WHERE email = ?'
  const updateParams = [password, nowTime, email];
  try{
    pool.sqlQuery(update, updateParams, function(err, result){
      if(err){
        res.status(500).json('重置密码失败');
        console.log(err);
      }else{
        res.status(200).json('重置密码成功');
      }
    });
  }catch(err){
    res.status(500).send('服务器错误!');
  }
})

usersRouter.post('/admin', new AuthUse(1).w, async function(req, res, next){
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
        let nowTime = getTime('date_time');
        const update = 'UPDATE users SET level = ?, updated_at = ? WHERE uid = ?'
        const updateParams = [result[0].level, nowTime, uid];
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

module.exports = usersRouter;
