let express = require('express');
const fs = require('fs');
const { AuthUse } = require('../utils/jwt')
const path = require('path');
var imageRouter = express.Router();

/* GET Fall Image */
imageRouter.get('/getImage', function(req, res, next) {
  const imagePath = req.query.path;
  fs.readFile(path.join(__dirname, '..', imagePath), function(err, data){
    if (err) {
        console.log(err);
        res.status(404).send('读取图片错误')
    }else {
        res.send(data)
    }
  })
});

module.exports = imageRouter;
