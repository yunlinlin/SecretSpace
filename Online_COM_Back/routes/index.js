let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Life Slice' , message: 'Welcome to Life Slice! Don\'t hesitate to join us!'});
});

module.exports = router;
