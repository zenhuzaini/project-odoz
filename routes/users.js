var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('try');
});

router.get('/artikel', function(req, res, next) {
  res.render('article/viewarticle_pagebst');
});

module.exports = router;
