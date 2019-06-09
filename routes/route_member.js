var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload    = require('./upload');

var db_member_odoz = require('../models/odoz_member.model.js');
var db_dailydonation_odoz = require('../models/odoz_dailydonation.model.js');

//<--fungsi GET--> read
router.get('/', function(req, res, next){  
    res.render('member/member_lamanawal', { title: 'Laman Awal' });
});

// <--fungsi get--> add page
router.get('/addmemberodoz', function(req, res, next){
  sess=req.session; 
  var nav;
  if(sess.email){
    nav= '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">'+sess.email+'</a>';
    res.redirect('/logout', { title: 'ODOZ | Login', nav });
  }else{
    nav = '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">Join Us!</a>';
    res.render('member/addmember_page', { title: 'Sign Up - ODOZ',  msg:req.query.msg, nav });
  }  
});

router.post('/post_addmemberOdoz', function(req, res, next){  
    upload(req, res,(error) => {
        if(error){
           res.redirect('addmemberodoz/?msg=3');
        }else{
          if(req.file == undefined){
            res.redirect('addmemberodoz?msg=2');
          }else{
               
              /**
               * Create new record in mongoDB
               */
              var fullPath = "/public/files/"+req.file.filename;
  
              var savemembereData = {
                member_fotopath: fullPath, 
                member_name: req.body.member_name,
                member_country: req.body.member_country,
                member_address: req.body.member_address,
                member_mail: req.body.member_mail,
                member_password: req.body.member_password,
                member_link: req.body.member_link
              };
    
            var helpSave = new db_member_odoz(savemembereData); 
            helpSave.save(function(error){
              if(error){ 
                throw error;
              } 
              res.redirect('listmemberodoz');
           });
        }
      }
    });    
});

// <--fungsi get--> add
router.get('/listmemberodoz', async function(req, res, next){ 
        const seeAllmember = await db_member_odoz.find();
        res.render('member/listmember_page', { title: 'Berhasil', seeAllmember });
  
});

router.get('/editmemberodoz/:id', async function(req, res, next) {
    const editmember = await db_member_odoz.findById(req.params.id);
    console.log(editmember)
    res.render('member/editmember_page', { editmember });
});
  
router.post('/editmemberodoz/:id', async function(req, res, next) {
    const { id } = req.params;
    await db_member_odoz.update({_id: id}, req.body);
    res.redirect('/member/listmemberodoz');
});

router.get('/deletememberodoz/:id', async function(req, res, next) {
  let { id } = req.params;
  await db_member_odoz.remove({_id: id});
  res.redirect('/member/listmemberodoz');
});

router.get('/setstatusmemberodoz/:id', async function(req, res, next) {
  let { id } = req.params;
  const statusmember = await db_member_odoz.findById(id);
  statusmember.member_status = !statusmember.member_status;
  await statusmember.save();
  res.redirect('/member/listmemberodoz');
});

router.get('/viewmemberodoz/:id', async function(req, res, next) {
    const viewmember = await db_member_odoz.findById(req.params.id);
    const nav ='<h1>Nav</h1>'
    console.log(viewmember)
    res.render('member/viewmember_page', { viewmember, nav });
});


//Baru Diimplementasikan

router.get('/login', function(req, res, next){
  sess=req.session; 
  var nav;
  if(sess.email){
    nav= '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">'+sess.email+'</a>';
    res.redirect('/', { title: 'ODOZ', nav });
  }else{
    nav = '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">Join Us!</a>';
    res.render('member/loginmember_page', { title: 'ODOZ | Login', nav });
  }  
});

//<--fungsi POST--> Untuk Login
router.post('/loginauth', function (req, res, next) {
	//console.log(req.body);
	db_member_odoz.findOne({member_mail:req.body.member_mail},function(err,dataku){
		if(dataku){
			if(dataku.member_password==req.body.member_password){
        sess=req.session;
        sess.email=req.body.member_mail;
        res.send({"Success":"Success!"});
        console.log('Session is made : '+ sess.email);
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/admin', async function(req, res, next){
  sess=req.session;
  var mysort = { ddonation_transactionID: -1 };
  const viewadmin = await db_member_odoz.findOne({member_mail:sess.email});
  const getdailydonationinfo = await db_dailydonation_odoz.find({member_mail:sess.email}).limit(7).sort(mysort);
  const getdailydonationinfo2 = await db_dailydonation_odoz.find({member_mail:sess.email});

  var nav;
  if(sess.email){  
    console.log('halo ', sess); 
    res.render('admin/base_coba', { title: 'ODOZ | Login', viewadmin, getdailydonationinfo, getdailydonationinfo2 });
    console.log('viewadmin');
  }
  else{
    console.log('login dulu');
    res.render('admin/loginmember_mustlogin', { title: 'Login or Regitser - ODOZ', nav});  
  }
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

module.exports = router;