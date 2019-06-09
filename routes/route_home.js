var express = require('express');
var router = express.Router();

var db_member_odoz = require('../models/odoz_member.model.js');
var db_article_odoz = require('../models/odoz_article.model.js');
var db_campaign_odoz = require('../models/odoz_campaign.model');
var db_event_odoz = require('../models/odoz_event.model');

/* GET home page. */
router.get('/', async function(req, res, next) {
  sess=req.session; 
  var nav;
  if(sess.email){
    nav= '<a class="btn btn-primary btn-rounded my-0" href="/member/admin" target="_blank">'+sess.email+'</a><a class="btn btn-danger btn-rounded my-0" href="/logout" target="_blank">logout</a>';
  }else{
    nav = '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">Join us!</a><a class="btn btn-success btn-rounded my-0" href="/member/login" target="_blank">Login</a>';
  }

  const mysort = { _id: -1 };

  const seeAllmember = await db_member_odoz.find().limit(4);
  const seeAllarticle = await db_article_odoz.find().limit(4);
  const seeAllCampaign = await db_campaign_odoz.find().limit(4).sort(mysort);
  const seeAllEvent = await db_event_odoz.find().limit(3).sort(mysort);

  res.render('v_home/home.ejs', { title: 'ODOZ - One Day One Zloty', nav, seeAllmember, seeAllarticle, seeAllCampaign, seeAllEvent });
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
