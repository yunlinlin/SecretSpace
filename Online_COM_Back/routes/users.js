const express = require('express');
// const { mysql } = require('access-db');
let pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt');
const nodemailer = require('nodemailer');
const { getTime } = require('../utils/Time');
const { genToken } = require('../utils/jwt');
let usersRouter = express.Router();

/* GET users listing. */
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
        console.log('查询数据失败');
      }else{
        console.log('查询数据成功');
        res.json(result);
      }
    })
  }catch(err){
    res.status(500).send('网络错误!');
  }
  });

  // let list = (await mysql.find('users', {
  //     p0:['uid', '=', uid],
  //     p1:['email', '=', address],
  //     r: 'p0 || p1',
  // })).data.objects;
  // res.json(list);

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
  })
})

usersRouter.post('/addInfo', async (req, res, next) => {
  let {uid, name, password, email} = req.body;
  uid = JSON.parse(uid);
  let nowTime = getTime('date_time');
  avatarURL = '/defaultFigure.jpg'
  const addSql = 'INSERT INTO users(uid, name, avatar, nickname, password, email, created_at, updated_at, level) values(?, ?, ?, ?, ?, ?, ?, ?)';
  const addSqlParams = [uid, name, avatarURL, name, password, email, nowTime, nowTime, 1];
  try{
    pool.sqlQuery(addSql, addSqlParams, function(err, result){
      if(err){
        console.log('添加数据失败');
      }else{
        console.log('添加数据成功');
        res.json({
          data: {
            token: genToken(uid, 1),
            uid: uid,
            nickname: name,
          },
          message : '成功',
        })
      }
    })
  }catch(err){
    res.status(500).send('网络错误!');
  }

  // let setRes = (await mysql.set('users', {
  //     // uid: uid,
  //     // name: name,
  //     // password: password,
  //     // email: email,
  //     // created_at: nowTime,
  //     // updated_at: nowTime,
  //     level: 1,
  // }));
  // let resUser = {
  //   ...setRes.data,
  //   token: genToken(uid, 1),
  //   uid: uid,
  // }
  // res.json({
  //   data: resUser,
  //   message : '成功',
  // })
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
            nickName: result[0].nickname,
            avatar: result[0].avatar,
            message : '查询成功',
          })
        }
      }
    });
  }catch(err){
    res.status(500).send('网络错误!');
  }
  // let setRes = (await mysql.find('users', {
  //   p0:['uid', '=', uid],
  //   r: 'p0',
  // })).data.objects[0];
  // res.json({
  //   nickName: setRes.nickname,
  //   avatar: setRes.avatar,
  //   message : '成功',
  // })
})

module.exports = usersRouter;
