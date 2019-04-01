var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var upload    = require('./upload');

var db_member_odoz = require('../models/odoz_member.model.js');

//<--fungsi GET--> read
router.get('/', function(req, res, next){  
    res.render('member/member_lamanawal', { title: 'Laman Awal' });
});

// <--fungsi get--> add page
router.get('/addmemberodoz', function(req, res, next){  
    res.render('member/addmember_page', { title: 'Berhasil', msg:req.query.msg });
});

// // <--fungsi POST--> add
// router.post('/post_addmemberOdoz', function(req, res, next){  
//     const addNewMember = new db_member_odoz(req.body);
//     addNewMember.save();
//     res.redirect('listmemberodoz');
// });

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
    sesi = req.session;
    
        const seeAllmember = await db_member_odoz.find();
        res.render('member/listmember_page', { title: 'Berhasil', seeAllmember });
        console.log('berhasil session');
 
        res.write('login dulu');
        // res.redirect('/member/login', {pesan: "You first must login"});
        console.log('enggak berhasil session');
  
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
    console.log(viewmember)
    res.render('member/viewmember_page', { viewmember });
});


//Baru Diimplementasikan
//<--fungsi GET--> Unuk Login
router.get('/login', function(req, res, next){  
    res.render('v_registerlogin/login', { title: 'Laman Awal' });
});

//<--fungsi POST--> Untuk Login
router.post('/loginauth', function (req, res, next) {
	//console.log(req.body);
	db_member_odoz.findOne({member_mail:req.body.member_mail},function(err,dataku){
		if(dataku){
			if(dataku.member_password==req.body.member_password){
				//console.log("Done Login");
				// req.session.usernya = req.body.member_mail;
                //console.log(req.session.userId);
                sess = req.session;
                var sesinya = req.body.member_mail;
                sess.sesinya;

                res.send({"Success":"Success!"});
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
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







// // <--fungsi POST--> add
// router.post('/post_addmemberOdoz', function(req, res, next){  
//     member_odoz.create(req.body, function(err, post){
//         if(err) return next(err);
// 		res.json(post);
//     });
// });

//fungsi get /guru/id
// router.get('/:id', function(req, res, next){  
//     member_odoz.findById(req.params.id, function(err, post){
//         if(err) return next(err);
//         res.json(post);
//     });
// });

// //fungsi PUT /guru/id
// router.put('/:id', function(req, res, next){  
//     member_odoz.findByIdAndUpdate(req.params.id, req.body, function(err, post){
//         if(err) return next(err);
//         res.json(post);
//     });
// });

// //fungsi DELETE /guru/id
// router.delete('/:id', function(req, res, next){  
//     member_odoz.findByIdAndRemove(req.params.id, req.body, function(err, post){
//         if(err) return next(err);
//         res.json(post);
//     });
// });
module.exports = router;