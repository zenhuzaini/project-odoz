var express = require('express');
var router    = express.Router();
var upload    = require('./upload');
var mongoose  = require('mongoose');
// var Photo     = mongoose.model('Photos');

var db_gallery_odoz = require('../models/odoz_gallery.model.js');

/* GET home page. */
router.get('/', function(req, res, next) {

    db_gallery_odoz.find({}, ['path','caption'], {sort:{ _id: -1} }, function(err, photos) {
    res.render('coba_gallery', { title: 'NodeJS file upload tutorial', msg:req.query.msg, photolist : photos });
  });
});

/** Upload file to path and add record to database */

router.post('/upload', function(req, res) {
  upload(req, res,(error) => {
      if(error){
         res.redirect('/gallery/?msg=3', {pesan:'ukuran terlalu besar'});
      }else{
        if(req.file == undefined){
          res.redirect('/?msg=2');
        }else{
             
            /**
             * Create new record in mongoDB
             */
            var fullPath = "/public/files/"+req.file.filename;

            var document = {
              path:     fullPath, 
              caption:   req.body.caption
            };
  
          var photo = new db_gallery_odoz(document); 
          photo.save(function(error){
            if(error){ 
              throw error;
            } 
            res.redirect('/?msg=1');
         });
      }
    }
  });    
});

module.exports = router;
