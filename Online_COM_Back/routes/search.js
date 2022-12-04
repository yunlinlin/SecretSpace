let express = require('express');
const pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt')
var searchRouter = express.Router();

/* GET search Item */
searchRouter.get('/searchItem', new AuthUse(1).w, function(req, res, next) {
  const { searchClass, searchText, itemNum, startIndex } = req.query;
  const select = 'SELECT users.nickname, users.avatar, item.id, item.uid, item.topicValue, item.likeCount, item.storeCount, item.created_at FROM item INNER JOIN users ON item.uid = users.uid WHERE item.classify IN (?) AND (item.topicValue REGEXP ? OR item.contentValue REGEXP ?) ORDER BY item.created_at DESC LIMIT ?, ?'
  const selectParams = [searchClass, searchText, searchText, JSON.parse(startIndex), JSON.parse(itemNum)];
  pool.query(select, selectParams, function(err, result){
      if(err){
          res.status(500).json('获取数据失败');
          console.log(err, '获取活动信息数据失败');
      }
      else{
          if(result.length > 0){
              let listPromise = [];
              for(let i = 0; i < result.length; i++){
                  listPromise.push(new Promise((resolve, reject) =>{
                      const showImage = 'SELECT * FROM image WHERE sortName in (?) AND sortId = ? AND imageRank = 1';
                      const Params = [searchClass, result[i].id];
                      pool.query(showImage, Params, function(error, imageResult){
                          if(error){
                              console.log('获取首页图片失败');
                              reject(error);
                          }
                          else{
                              result[i].image = imageResult;
                              resolve(result[i]);
                          }
                      })
                  }))
              }
              Promise.all(listPromise).then((result) => {
                  res.json(result);
              }).catch((error) => {
                  res.status(500).json('获取封面失败');
                  console.log(error);
              })
          }else{
              res.json(result);
          }
      }
  })
});

module.exports = searchRouter;
