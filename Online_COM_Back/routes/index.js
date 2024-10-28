let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '欢迎加入我们!' });
});

module.exports = router;
