var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

//add
var bodyParser = require('body-parser')
var gm = require('gm').subClass({imageMagick: true});
var FroalaEditor = require('wysiwyg-editor-node-sdk/lib/froalaEditor.js');
var fs = require('fs');
//add

var app = express();

var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session); //having this module will take  along ime

//hubungkan ke Mongodb 
var aaa = mongoose.connect('mongodb://localhost/project_odoz',{
  useNewUrlParser: true
}); 
if (aaa) {
  console.log('Berhasil terhubung dengan MongoDB');
} else {
  console.error(err);
};

mongoose.Promise = global.Promise;
const db = mongoose.connection;

app.use(cookieParser());
app.use(session({
    secret: 'bismillah',
    resave: false,
    saveUninitialized: true,
    cookie:{
      expires:60000
    },
    store: new MongoStore({ mongooseConnection: db })
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));

//app.use(express.static(path.join(__dirname, 'public')));//real
//app.use("/public", express.static(path.join(__dirname + '/public'))); //kalau ini yang dipake, jadi ketika ada link yang ingin  di load maka ditambah 'public/...'
app.use("/public",express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


var indexRouter = require('./routes/route_home');
var usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);

// //route foto
var foto_odoz = require('./routes/route_gallery.js');
app.use('/gallery', require('./routes/route_gallery'));

// //route home
var homepage_odoz = require('./routes/route_home.js');
app.use('/home', require('./routes/route_home.js'));

// //route member
var member_odoz = require('./routes/route_member.js');
app.use('/member', member_odoz);

//for article
var article_odoz = require('./routes/route_article.js');
app.use('/addarticle', article_odoz);

//for campaign
var campaign_odoz = require('./routes/route_campaign.js');
app.use('/addcampaign', campaign_odoz);

//route for event
var event_odoz = require('./routes/route_event.js');
app.use('/event', event_odoz);

// app.get('/updatearticle/:id', function(req, res) {
//   // res.sendFile(__dirname + '/index.html');
//   res.render('article/addarticle_page.ejs', { title: 'Ini blog' });
// });
// var db_article_odoz = require('../models/odoz_article.model.js');
// app.get('/updatearticle/:id', async function(req, res, next) {
//   const editarticle = await db_article_odoz.findById(req.params.id);
//   console.log(editarticle)
//   res.render('article/updatearticle_page', { editarticle });
// });



app.post('/upload_image', function (req, res) {

  FroalaEditor.Image.upload(req, '/public/uploads/', function(err, data) {
    console.log(data);
    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/upload_video', function (req, res) {

  FroalaEditor.Video.upload(req, '/public/uploads/video', function(err, data) {

    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/upload_image_resize', function (req, res) {

  var options = {
    resize: [300, 300]
  }
  FroalaEditor.Image.upload(req, '/public/uploads/', options, function(err, data) {

    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/upload_image_validation', function (req, res) {

  var options = {
    fieldname: 'myImage',
    validation: function(filePath, mimetype, callback) {

      gm(filePath).size(function(err, value){

        if (err) {
          return callback(err);
        }

        if (!value) {
          return callback('Error occurred.');
        }

        if (value.width != value.height) {
          return callback(null, false);
        }
        return callback(null, true);
      });
    }
  }

  FroalaEditor.Image.upload(req, 'public/uploads/', options, function(err, data) {

    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/upload_file', function (req, res) {

  var options = {
    validation: null
  }

  FroalaEditor.File.upload(req, 'public/uploads/', options, function(err, data) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/upload_file_validation', function (req, res) {

  var options = {
    fieldname: 'myFile',
    validation: function(filePath, mimetype, callback) {

      fs.stat(filePath, function(err, stat) {

        if(err) {
          return callback(err);
        }

        if (stat.size > 10 * 1024 * 1024) { // > 10M
          return callback(null, false);
        }

        return callback(null, true);

      });
    }
  }

  FroalaEditor.File.upload(req, 'public/uploads/', options, function(err, data) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/delete_image', function (req, res) {

  FroalaEditor.Image.delete(req.body.src, function(err) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});
app.post('/delete_video', function (req, res) {

  FroalaEditor.Video.delete(req.body.src, function(err) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});

app.post('/delete_file', function (req, res) {

  FroalaEditor.File.delete(req.body.src, function(err) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});

app.get('/load_images', function (req, res) {

  FroalaEditor.Image.list('/uploads/', function(err, data) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.send(data);
  });
});

app.get('/get_amazon', function (req, res) {

  var configs = {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
    keyStart: process.env.AWS_KEY_START,
    acl: process.env.AWS_ACL,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY
  }

  var configsObj = FroalaEditor.S3.getHash(configs);
  res.send(configsObj);
});

// Create folder for uploading files.
var filesDir = path.join(path.dirname(require.main.filename), 'uploads');
if (!fs.existsSync(filesDir)){
    fs.mkdirSync(filesDir);
}
//end add from server.js


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(4000, () => console.log(`Example app listening on port ${3000}!`))

module.exports = app;


// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var fs = require('fs');
// var logger = require('morgan');
// var session = require('express-session');
// var bodyParser = require('body-parser');

// var mongoose = require('mongoose');
// var MongoStore = require('connect-mongo')(session); //having this module will take  along ime

// var app = express();

// var sess;

// //hubungkan ke Mongodb 
// var aaa = mongoose.connect('mongodb://localhost/project_odoz',{
//   useNewUrlParser: true
// }); 
// if (aaa) {
//   console.log('Berhasil terhubung dengan MongoDB');
// } else {
//   console.error(err);
// };

// mongoose.Promise = global.Promise;
// const db = mongoose.connection;

// app.use(cookieParser());
// app.use(session({
//     secret: 'bismillah',
//     resave: false,
//     saveUninitialized: true,
//     cookie:{
//       expires:60000
//     },
//     store: new MongoStore({ mongooseConnection: db })
// }));

//   //importing routes
// var indexRouter = require('./routes/route_home');
// var usersRouter = require('./routes/users');

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// //routesCoba
// var buatlogin = require('./routes/index');
// app.use('/login', buatlogin);

// app.use('/tryeditor', function(req, res){
//   res.render('try', {title: 'coba'});
// });

// app.get('/adminn',function(req,res){
//   sess = req.session;
//   var a = sess.member_mail;
//   if(a){
//     res.write('<h1> Hello'+sess.member_mail+'</h1>');
//     console.log('berhasil session');
//   }else{
//     res.write('login dulu');
//     res.end('<a href="+">login</a>');
//     console.log('enggak berhasil session');
//   }
// });


// //routes
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// //route home
// var homepage_odoz = require('./routes/route_home.js');
// app.use('/home', require('./routes/route_home.js'));

// //route member
// var member_odoz = require('./routes/route_member.js');
// app.use('/member', member_odoz);

// //route article
// var article_odoz = require('./routes/route_article.js');
// app.use('/article', article_odoz);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// // // listen on port 3000
// // app.listen(3000, function () {
// //   console.log('Express app listening on port 3000');
// // });

// module.exports = app;
