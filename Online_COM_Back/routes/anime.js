var express = require('express');
var routerAnime = express.Router();

// const {mysql} = require('access-db');
const { AuthUse } = require('../utils/jwt');

/* GET users listing. */
routerAnime.get('/', function(req, res, next) {
  res.send('anime api');
});

/* Data Access */
routerAnime.post('/add', new AuthUse(0).w, async function(req, res, next) {
  const {title, count} = req.body
  try{
    let tempRes = await mysql.set('image', {
      title: title,
      count: count
    })
    res.json(tempRes.data.insertId)
  }catch(err) {
    console.log('error', err)
  }
})

routerAnime.get('/detail/:id', async function(req, res, next){
  const {id} = req.params;
  let temp = await mysql.get('image', id);
  res.json(temp.data)
})

routerAnime.put('/update/:id', async function(req, res, next){
  const {id} = req.params
  const {title} = req.body
  let temp = await mysql.update('image', id, {
    title:title
  })
  res.json(temp.data.changedRows)
})

routerAnime.get('/list/:page', async function(req, res, next){
  const {page} = req.params
  let temp = await mysql.find('image', {
    p0:['title', '=', '可爱的小孩'],
    r: 'p0'
  })
  res.json(temp.data.objects)
})

module.exports = routerAnime;