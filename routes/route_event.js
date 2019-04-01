var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload    = require('./uploadevent');

var db_event_odoz = require('../models/odoz_event.model.js');

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
    console.log(viewevent)
    res.render('event/viewevent_page', { viewevent });
});

module.exports = router;