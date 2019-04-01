var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('v_home/home.ejs', { title: 'ODOZ - One Day One Zloty' });
});

router.get('/lokasi', function(req, res, next) {
  res.render('v_home/home.ejs', { title: 'Ini Lokasi' });
});

router.get('/blog', function(req, res, next) {
  res.render('v_home/home.ejs', { title: 'Ini blog' });
});

router.get('/blog/id', function(req, res, next) {
  res.render('v_home/home.ejs', { title: 'Ini detail blog' });
});

module.exports = router;
