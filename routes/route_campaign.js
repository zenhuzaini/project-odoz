var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload    = require('./uploadcamp');

var db_campaign_odoz = require('../models/odoz_campaign.model.js');

//<--fungsi GET--> read
router.get('/', function(req, res, next){  
    res.render('campaign/addcampaign_page', { title: 'List campaigns' });
});

// // <--fungsi POST--> add
// router.post('/post_addcampaign', function(req, res, next){  
//     const addNewcampaign = new db_campaign_odoz(req.body);
//     addNewcampaign.save();
//     res.redirect('listcampaignodoz');
// });

router.post('/post_addcampaign', function(req, res, next){  
    upload(req, res,(error) => {
        if(error){
           res.redirect('addcampaign?msg=3');
        }else{
          if(req.file == undefined){
            res.redirect('addcampaign?msg=2');
          }else{
               
              /**
               * Create new record in mongoDB
               */
              var fullPath = "/public/files_campaign/"+req.file.filename;
  
              var saveCampaignData = {
                camp_fotopath: fullPath, 
                camp_title: req.body.camp_title,
                camp_date: req.body.camp_date,
                camp_description: req.body.camp_description
              };
    
            var helpSave = new db_campaign_odoz(saveCampaignData); 
            helpSave.save(function(error){
              if(error){ 
                throw error;
              } 
              res.redirect('listcampaignodoz');
           });
        }
      }
    });    
});


// <--fungsi get--> add
router.get('/listcampaignodoz', async function(req, res, next){ 
      const seeAllcampaigns = await db_campaign_odoz.find();
      res.render('campaign/listcampaign_page', { title: 'Berhasil', seeAllcampaigns });
});

router.get('/editcampaignodoz/:id', async function(req, res, next) {
    const editcampaign = await db_campaign_odoz.findById(req.params.id);
    console.log(editcampaign)
    res.render('campaign/updatecampaign_page', { editcampaign });
});

router.post('/editcampaignodoz/:id', async function(req, res, next) {
    const { id } = req.params;
    await db_campaign_odoz.update({_id: id}, req.body);
    res.redirect('/addcampaign/listcampaignodoz');
});


router.get('/deletecampaignodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    await db_campaign_odoz.remove({_id: id});
    res.redirect('/addcampaign/listcampaignodoz');
  });

router.get('/setstatuscampaignodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    const statuscampaign = await db_campaign_odoz.findById(id);
    statuscampaign.camp_status = !statuscampaign.camp_status;
    await statuscampaign.save();
    res.redirect('/addcampaign/listcampaignodoz');
  });

router.get('/viewcampaignodoz/:id', async function(req, res, next) {
    const viewcampaign = await db_campaign_odoz.findById(req.params.id);
    console.log(viewcampaign)
    res.render('campaign/viewcampaign_page', { viewcampaign });
});

module.exports = router;