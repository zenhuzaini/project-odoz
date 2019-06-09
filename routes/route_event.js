var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload    = require('./uploadevent');

var db_event_odoz = require('../models/odoz_event.model.js');
var col_event_visitor = require('../models/odoz_eventvisitor.model.js');
var db_member_odoz = require('../models/odoz_member.model.js');

//<--fungsi GET--> read
router.get('/', function(req, res, next){  
    res.render('event/addevent_page', { title: 'List events' });
});

router.get('/addeventodoz', function(req, res, next){  
    res.render('event/addevent_page', { title: 'List events' });
});

// // <--fungsi POST--> add
// router.post('/post_addevent', function(req, res, next){  
//     const addNewevent = new db_event_odoz(req.body);
//     addNewevent.save();
//     res.redirect('listeventodoz');
// });

router.post('/post_addevent', function(req, res, next){  
    upload(req, res,(error) => {
        if(error){
           res.redirect('addevent?msg=3');
        }else{
          if(req.file == undefined){
            res.redirect('addevent?msg=2');
          }else{
               
              /**
               * Create new record in mongoDB
               */
              var fullPath = "/public/files_event/"+req.file.filename;
  
              var saveeventData = {
                event_fotopath: fullPath, 
                event_title: req.body.event_title,
                event_time: req.body.event_time,
                event_date: req.body.event_date,
                event_creator : 'zen96ev@gmail.com',
                event_description: req.body.event_description
              };
    
            var helpSave = new db_event_odoz(saveeventData); 
            helpSave.save(function(error){
              if(error){ 
                throw error;
              } 
              res.redirect('listeventodoz');
           });
        }
      }
    });    
});


// <--fungsi get--> add
router.get('/listeventodoz', async function(req, res, next){ 
      const seeAllevents = await db_event_odoz.find();
      res.render('event/listevent_page', { title: 'Berhasil', seeAllevents });
});

router.get('/editeventodoz/:id', async function(req, res, next) {
    const editevent = await db_event_odoz.findById(req.params.id);
    console.log(editevent)
    res.render('event/updateevent_page', { editevent });
});

router.post('/editeventodoz/:id', async function(req, res, next) {
    const { id } = req.params;
    await db_event_odoz.update({_id: id}, req.body);
    res.redirect('/event/listeventodoz');
});

router.get('/deleteeventodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    await db_event_odoz.remove({_id: id});
    res.redirect('/event/listeventodoz');
  });

router.get('/setstatuseventodoz/:id', async function(req, res, next) {
    let { id } = req.params;
    const statusevent = await db_event_odoz.findById(id);
    statusevent.event_status = !statusevent.event_status;
    await statusevent.save();
    res.redirect('/event/listeventodoz');
  });

router.get('/vieweventodoz/:id', async function(req, res, next) {
    const viewevent = await db_event_odoz.findById(req.params.id);
    console.log(viewevent);
    sess=req.session; 
    var nav;
    if(sess.email){
      nav= '<a class="btn btn-primary btn-rounded my-0" href="/member/admin" target="_blank">'+sess.email+'</a><a class="btn btn-danger btn-rounded my-0" href="/logout" target="_blank">logout</a>';
    }else{
      nav = '<a class="btn btn-primary btn-rounded my-0" href="/member/addmemberodoz" target="_blank">Join us!</a><a class="btn btn-success btn-rounded my-0" href="/member/login" target="_blank">Login</a>';
    }
    var thequery = {event_id : req.params.id};
    const seeallvisitors = await col_event_visitor.find(thequery);
    const berapavisistor = seeallvisitors.length;

    res.render('event/viewevent_page', { viewevent, nav, berapavisistor });
});

// <--fungsi POST--> register
router.post('/registerevent', function(req, res, next){  
    const eventvisitor = new col_event_visitor(req.body);
    eventvisitor.save();
    const idnya = req.body.event_id;
    console.log(idnya);
    res.redirect('vieweventodoz/'+ req.body.event_id);
});

// <--fungsi get-- admin> 
router.get('/myevents', async function(req, res, next){
  sess=req.session;

  const viewadmin = await db_member_odoz.findOne({member_mail:sess.email});

  var thequery = {event_creator : sess.email}; 
  const seeevents = await db_event_odoz.find(thequery);
 
  var nav;
  if(sess.email){  
    console.log('halo ', sess); 
    res.render('admin/event_admin_listevents', { title: 'List Article | ODOZ', viewadmin, seeevents });
    console.log(seeevents);
  }
  else{
    console.log('login dulu');
    res.render('admin/loginmember_mustlogin', { title: 'Login or Regitser - ODOZ', nav});
  }
});


module.exports = router;