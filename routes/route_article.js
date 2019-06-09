var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload = require('./uploadarticle');

var db_article_odoz = require('../models/odoz_article.model.js');

var db_member_odoz = require('../models/odoz_member.model.js');
var db_dailydonation_odoz = require('../models/odoz_dailydonation.model.js');

//<--fungsi GET--> read
router.get('/addarticle', async function(req, res, next){
  
  sess=req.session;
  var mysort = { ddonation_transactionID: -1 };
  const viewadmin = await db_member_odoz.findOne({member_mail:sess.email});
  const getdailydonationinfo = await db_dailydonation_odoz.find({member_mail:sess.email}).limit(7).sort(mysort);
  const getdailydonationinfo2 = await db_dailydonation_odoz.find({member_mail:sess.email});

  var nav;
  if(sess.email){  
    console.log('halo ', sess); 
    res.render('admin/article_admin_makearticle', { title: 'ODOZ | Login', viewadmin, getdailydonationinfo, getdailydonationinfo2 });
    console.log('viewadmin');
  }
  else{
    console.log('login dulu');
    res.render('admin/loginmember_mustlogin', { title: 'Login or Regitser - ODOZ', nav});
  }
});

// <--fungsi get--> add page
router.get('/addarticle2', function(req, res, next){  
    res.render('article/addarticle_page', { title: 'Berhasil' });
});

// // <--fungsi POST--> add
router.post('/real_post_addarticle', function(req, res, next){  
    const addNewArticle = new db_article_odoz(req.body);
    addNewArticle.save();
    res.redirect('listarticleodoz');
});

router.post('/post_addarticle', function(req, res, next){
  var sess = req.session.email;  
    upload(req, res,(error) => {
        if(error){
           res.redirect('/article?msg=3');
        }else{
          if(req.file == undefined){
            res.redirect('/article?msg=2');
          }else{
              var fullPath = "/public/files_article/"+req.file.filename;
  
              var savearticleData = {
                article_image: fullPath,
                article_title : req.body.article_title,
                article_date: req.body.article_date,
                article_creator : sess,
                article_description: req.body.article_description
              };

              console.log("ini adalah sesinya "+ sess);
    
            var helpSave = new db_article_odoz(savearticleData); 
            helpSave.save(function(error){
              if(error){ 
                throw error;
              } 
              res.redirect('listarticleodoz');
           });
        }
      }
    });    
});


// <--fungsi get--> add
router.get('/listarticleodoz', async function(req, res, next){ 
      const seeAllarticles = await db_article_odoz.find();
      res.render('article/listarticle_page', { title: 'Berhasil', seeAllarticles });
});

// <--fungsi get-- admin> 
router.get('/myarticles', async function(req, res, next){
  sess=req.session;

  const viewadmin = await db_member_odoz.findOne({member_mail:sess.email});

  var thequery = {article_creator : sess.email}; 
  const seeAllarticles = await db_article_odoz.find(thequery);
 
  var nav;
  if(sess.email){  
    console.log('halo ', sess); 
    res.render('admin/article_admin_listarticles', { title: 'List Article | ODOZ', viewadmin, seeAllarticles });
    console.log('viewadmin');
  }
  else{
    console.log('login dulu');
    res.render('admin/loginmember_mustlogin', { title: 'Login or Regitser - ODOZ', nav});
  }
});

router.get('/editarticleodoz/:id', async function(req, res, next) {
    const editarticle = await db_article_odoz.findById(req.params.id);
    console.log(editarticle)
    res.render('article/updatearticle_page', { editarticle });
});

router.post('/editarticleodoz/:id', async function(req, res, next) {
    const { id } = req.params;
    await db_article_odoz.update({_id: id}, req.body);
    res.redirect('/article/listarticleodoz');
});

router.get('/deletearticleodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    await db_article_odoz.remove({_id: id});
    res.redirect('article/listarticleodoz');
  });

router.get('/setstatusarticleodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    const statusarticle = await db_article_odoz.findById(id);
    statusarticle.article_status = !statusarticle.article_status;
    await statusarticle.save();
    res.redirect('/article/listarticleodoz');
  });

router.get('/viewarticleodoz/:id', async function(req, res, next) {
    const viewarticle = await db_article_odoz.findById(req.params.id);
    console.log(viewarticle);
    const nav = "Article ODOZ";
    res.render('article/viewarticle_page', { viewarticle, nav});
});

module.exports = router;