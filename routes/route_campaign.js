var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload    = require('./uploadcamp');

var db_campaign_odoz = require('../models/odoz_campaign.model.js');
var db_campaign_odoz_donation = require('../models/odoz_donationcampaign.model');
var db_member_odoz = require('../models/odoz_member.model');

//<--fungsi GET--> read
router.get('/', function(req, res, next){  
    res.render('campaign/addcampaign_page', { title: 'List campaigns' });
});

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
                camp_collect_until : req.body.camp_collect_until,
                camp_fund_needed : req.body.camp_fund_needed,
                camp_creator : 'zen96ev@gmail.com',
                camp_date: new Date(),
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

router.post('/searchcampaign/', async function(req, res, next) {
  console.log(req.body.searchlike);
  var help = req.body.searchlike;
  var contains = "/"+help+"/i";
  console.log(contains);
  const seeAllcampaigns = await db_campaign_odoz.find({ camp_title: /bisa/i });
  // res.json(seeAllcampaigns);
  res.render('campaign/listcampaign_page', { title: 'Berhasil', seeAllcampaigns });
});

router.post('/editcampaignodoz/:id', async function(req, res, next) {
    const { id } = req.params;
    await db_campaign_odoz.update({_id: id}, req.body);
    res.redirect('/campaign/listcampaignodoz');
});


router.get('/deletecampaignodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    await db_campaign_odoz.remove({_id: id});
    res.redirect('/campaign/listcampaignodoz');
  });

router.get('/setstatuscampaignodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    const statuscampaign = await db_campaign_odoz.findById(id);
    statuscampaign.camp_status = !statuscampaign.camp_status;
    await statuscampaign.save();
    res.redirect('/campaign/listcampaignodoz');
  });

router.get('/viewcampaignodoz/:id', async function(req, res, next) {
    const viewcampaign = await db_campaign_odoz.findById(req.params.id);
    const seeAllcampaigns = await db_campaign_odoz_donation.find();
    console.log(viewcampaign);
    var jumlah;

    for (var i=0; i < seeAllcampaigns.length; i++) { 
      if (seeAllcampaigns[i].cdonation_id_camp == viewcampaign._id){
        jumlah = jumlah+ seeAllcampaigns[i].cdonation_amount;
      }
    }

    console.log("jumlah donasi : "+ jumlah);

    sess=req.session; 
    var nav;
    if(sess.email){
      nav= '<a class="btn btn-primary btn-rounded my-0" href="/member/admin" target="_blank">'+sess.email+'</a><a class="btn btn-danger btn-rounded my-0" href="/logout" target="_blank">logout</a>';
    }else{
      nav = '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">Join us!</a><a class="btn btn-success btn-rounded my-0" href="/member/login" target="_blank">Login</a>';
    }
    
    res.render('campaign/viewcampaign_page', { viewcampaign, jumlah, seeAllcampaigns, title:'ODOZ', nav  });
});

router.get('/mycampaigns', async function(req, res){
  sess=req.session;
  var thequery = {camp_creator : sess.email};
  const viewcampaign = await db_campaign_odoz.find(thequery);
  const viewadmin = await db_member_odoz.findOne({member_mail:sess.email});
  var nav;
  if(sess.email){  
    console.log('halo ', sess); 
    res.render('admin/campaign_admin_list_campaign', { title: 'List Campaign | ODOZ', viewadmin, viewcampaign });
    console.log(viewadmin);
    console.log(viewcampaign);
  }
  else{
    console.log('login dulu');
    res.render('admin/loginmember_mustlogin', { title: 'Login or Regitser - ODOZ', nav});
  }

});

module.exports = router;