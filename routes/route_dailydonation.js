var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var db_dailydonation_odoz = require('../models/odoz_dailydonation.model.js');
var savesess="";

//var help to save payment data
var id = ""; 
var links = "";
var counter = "";
var jumlah = "";

router.get('/', function(req,res, next){
    sess=req.session;
    savesess = sess.email;
    if(sess.email)      
    {
        res.render('donation/dailydonation_page', {title: '<h1>Hello '+sess.email+'</h1>'}); 
        res.end('<a href='+'/logout'+'>Logout</a>');
        console.log('<h1>Hello '+sess.email+'</h1>'); 
    }else{  
        res.write('<h1>Please login first.</h1>');    
        res.end('<a href='+'/member/login'+'>Login</a>');    
    } 
});


// start payment process 
router.post('/donate' , ( req , res ) => {
    // create payment object
    sess=req.session;
    sess.mail
    jumlah = req.body.dailydonation;
    const nilai = "PLN";
    console.log('donation amount'+jumlah);
    console.log('ini adalah sessionya '+sess+' ini seesion mail'+ sess.mail);
      var payment = {
              "intent": "authorize",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/odoz/success",
          "cancel_url": "http://127.0.0.1:3000/odoz/err"
      },
      "transactions": [{
          "amount": {
              "total": jumlah,
              "currency": nilai
          },
          "description": " Buy a book "
      }]
      }
      
      // call the create Pay method 
      createPay( payment ) 
          .then( ( transaction ) => {
              id = transaction.id; 
              links = transaction.links;
              counter = links.length; 
              
              var saveDonation = {
                member_mail: savesess,
                ddonation_date: "April",
                ddonation_transactionID: id,
                ddonation_amount: jumlah
              };

              var helpSave = new db_dailydonation_odoz(saveDonation); 
              //save to db
              helpSave.save()
                .then(item => {
                    // res.send("item saved to database");
                    console.log( "tersimpan" ); 
                })
                .catch(err => {
                    // res.status(400).send("unable to save to database");
                    console.log( "gagal" ); 
                });
              
                while( counter -- ) {
                  if ( links[counter].method == 'REDIRECT') {
                      // redirect to paypal where user approves the transaction 
                      return res.redirect( links[counter].href )
                  }
              }
          })
          .catch( ( err ) => { 
              console.log( err ); 
              res.redirect('/err');
          });
  }); 
  
  
  // success page 
  router.get('/success' , (req ,res ) => {
    sess=req.session;
    sess.mail;
    console.log(req.query); 
    res.redirect('/member/admin'); 
  })
  
  // error page 
  router.get('/err' , (req , res) => {
      console.log(req.query); 
      res.redirect('/err.html'); 
  })

// helper functions 
var createPay = ( payment ) => {
    return new Promise( ( resolve , reject ) => {
        paypal.payment.create( payment , function( err , payment ) {
         if ( err ) {
             reject(err); 
         }
        else {
            resolve(payment); 
        }
        }); 
    });
  }

module.exports = router;