var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var db_article_odoz = require('../models/odoz_article.model.js');

//<--fungsi GET--> read
router.get('/', function(req, res, next){  
    res.render('article/addarticle_page', { title: 'List Articles' });
});

// <--fungsi get--> add page
router.get('/addarticle', function(req, res, next){  
    res.render('', { title: 'Berhasil' });
});

// // <--fungsi POST--> add
router.post('/post_addarticle', function(req, res, next){  
    const addNewArticle = new db_article_odoz(req.body);
    addNewArticle.save();
    res.redirect('listarticleodoz');
});

// <--fungsi get--> add
router.get('/listarticleodoz', async function(req, res, next){ 
      const seeAllarticles = await db_article_odoz.find();
      res.render('article/listarticle_page', { title: 'Berhasil', seeAllarticles });
});

router.get('/editarticleodoz/:id', async function(req, res, next) {
    const editarticle = await db_article_odoz.findById(req.params.id);
    console.log(editarticle)
    res.render('article/updatearticle_page', { editarticle });
});

router.post('/editarticleodoz/:id', async function(req, res, next) {
    const { id } = req.params;
    await db_article_odoz.update({_id: id}, req.body);
    res.redirect('/addarticle/listarticleodoz');
});

// router.post('/editcampaignodoz/:id', async function(req, res, next) {
//     const { id } = req.params._id;
//     await db_campaign_odoz.update({_id: id}, req.body);
//     res.redirect('/addcampaign/listcampaignodoz');
// });


router.get('/deletearticleodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    await db_article_odoz.remove({_id: id});
    res.redirect('/addarticle/listarticleodoz');
  });

router.get('/setstatusarticleodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    const statusarticle = await db_article_odoz.findById(id);
    statusarticle.article_status = !statusarticle.article_status;
    await statusarticle.save();
    res.redirect('/addarticle/listarticleodoz');
  });

router.get('/viewarticleodoz/:id', async function(req, res, next) {
    const viewarticle = await db_article_odoz.findById(req.params.id);
    console.log(viewarticle)
    res.render('article/viewarticle_page', { viewarticle });
});

module.exports = router;