var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var paypal = require('paypal-rest-sdk');

//add chat
var favicon = require('serve-favicon');
var s = require('underscore.string');
var readline = require('readline');
var sockjs = require('sockjs');
var https = require('https');
var chalk = require('chalk');

var log = require('./lib/log.js');
var utils = require('./lib/utils.js');
var config = require('./config.json');
var pack = require('./package.json');
var path = require('path');


/* Config */
var port = utils.normalizePort(process.env.PORT || config.port);
var app = express();
var server;


/* Variables */
var lastTime = [];
var rateLimit = [];
var currentTime = [];
var rateInterval = [];

var chat = sockjs.createServer();
var clients = [];
var users = {};
var bans = [];
var uid = 1;

var alphanumeric = /^\w+$/;

if(config.readline.use) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt(config.readline.prompt);
    rl.prompt();
}

app.locals.version = pack.version;

//end chat

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

//session start

app.use(cookieParser());
app.use(session({
    secret: 'bismillah',
    resave: false,
    saveUninitialized: true,
    cookie:{
      expires:6000000000
    }
}));

//chat start
app.get('/chat', function (req, res) {
  res.render('chat/index', {version:pack.version});
});
//chat end

var sess;
app.get('/sesi',function(req,res){  
  sess=req.session;  
  if(sess.email)  
  {  
      res.redirect('/'); 
      console.log('halo ', sess); 
  }  
  else{  
  console.log('login dulu');
  res.send('login dulu');  
  }  
});

app.post('/login',function(req,res){  
  sess=req.session;     
  sess.email=req.body.email;  
  res.end('done');  
});

//ini coba
app.get('/seslogin',function(req,res){  
  sess=req.session;     
  sess.email="uus";  
  //res.end('done');  
  res.redirect('/');
  console.log('sessinya : '+sess.email); 
});
//ini coba

app.get('/admin',function(req,res){  
  sess=req.session;  
  if(sess.email)      
  {   
      //res.render('lg.html');  
      res.write('<h1>Hello '+sess.email+'</h1><br>');  
      res.end('<a href='+'/logout'+'>Logout</a>');  
  }  
  else  
  {  
      res.write('<h1>Please login first.</h1>');    
      res.end('<a href='+'/'+'>Login</a>');    
  }    

});  

app.get('/logout',function(req,res){    
  req.session.destroy(function(err){  
      if(err){  
          console.log(err);  
      }  
      else  
      {  
          res.redirect('/');  
      }  
  });  

});  

//session end

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
app.use('/article', article_odoz);

//for campaign
var campaign_odoz = require('./routes/route_campaign.js');
app.use('/campaign', campaign_odoz);

//route for event
var event_odoz = require('./routes/route_event.js');
app.use('/event', event_odoz);

//Donation
// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AdFiQj56p3Skdlff3eD7BGnm_dBFYRX0JSQ1bA4yrgq1godgF_sl-77fCK4utlVH7xX7rqVlmkbfJTAD', // please provide your client id here 
  'client_secret': 'EMH6SyyGvHPsmAZmPGU6xpcHrDrbKQ_rdXsaeR8eR1f-23sfKNDlla6Yi-xLC7cxQS1LR-bZWGaYrtxM' // provide your client secret here 
});
// Route for daily donation
var dailydonation_odoz = require('./routes/route_dailydonation.js');
app.use('/odoz', dailydonation_odoz);

//route Donation 
var donation_campaign_odoz = require('./routes/route_campaigndonation.js');
app.use('/givedonation', donation_campaign_odoz);

// untuk froala
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

//start chat loong
/* Logic */
chat.on('connection', function(conn) {
  log('socket', chalk.underline(conn.id) + ': connected (' + conn.headers['x-forwarded-for'] + ')');
  rateLimit[conn.id] = 1;
  lastTime[conn.id] = Date.now();
  currentTime[conn.id] = Date.now();

  clients[conn.id] = {
      id: uid,
      un: null,
      ip: conn.headers['x-forwarded-for'],
      role: 0,
      con: conn,
      warn : 0
  };

  users[uid] = {
      id: uid,
      oldun: null,
      un: null,
      role: 0
  };
  
  for(i in bans) {
      if(bans[i][0] == clients[conn.id].ip) {
          if(Date.now() - bans[i][1] < bans[i][2]) {
              conn.write(JSON.stringify({type:'server', info:'rejected', reason:'banned', time:bans[i][2]}));
              return conn.close();
          } else {
              bans.splice(i);
          }
      }
  }

  conn.write(JSON.stringify({type:'server', info:'clients', clients:users}));
  conn.write(JSON.stringify({type:'server', info:'user', client:users[uid]}));
  conn.on('data', function(message) {
      currentTime[conn.id] = Date.now();
      rateInterval[conn.id] = (currentTime[conn.id] - lastTime[conn.id]) / 1000;
      lastTime[conn.id] = currentTime[conn.id];
      rateLimit[conn.id] += rateInterval[conn.id];

      if(rateLimit[conn.id] > 1) {
          rateLimit[conn.id] = 1;
      }

      if(rateLimit[conn.id] < 1 && JSON.parse(message).type != 'delete' && JSON.parse(message).type != 'typing' && JSON.parse(message).type != 'ping') {
          clients[conn.id].warn++;

          if(clients[conn.id].warn < 6) {
              return conn.write(JSON.stringify({type:'server', info:'spam', warn:clients[conn.id].warn}));
          } else {
              bans.push([clients[conn.id].ip, Date.now(), 5 * 1000 * 60]);
              utils.sendToAll(clients, {type:'ban', extra:clients[conn.id].un, message:'Server banned ' + clients[conn.id].un + ' from the server for 5 minutes for spamming the servers'});

              return conn.close();
          }
      } else {
          try {
              var data = JSON.parse(message);

              if(data.type == 'ping') {
                  return false;
              }

              if(data.type == 'typing') {
                  return utils.sendToAll(clients, {type:'typing', typing:data.typing, user:clients[conn.id].un});
              }

              if(data.type == 'delete' && clients[conn.id].role > 0) {
                  utils.sendToAll(clients, {type:'server', info:'delete', mid:data.message});
              }

              if(data.type == 'update') {
                  return updateUser(conn.id, data.user);
              }

              if(data.message.length > 768) {
                  data.message = data.message.substring(0, 768);
                  message = JSON.stringify(data);
              }

              if(data.type == 'pm') log('message', chalk.underline(clients[conn.id].un) + ' to ' + chalk.underline(data.extra) + ': ' + data.message);
              else log('message', '[' + data.type.charAt(0).toUpperCase() + data.type.substring(1) + '] ' + chalk.underline(clients[conn.id].un) + ': ' + data.message);

              handleSocket(clients[conn.id], message);
          } catch(err) {
              return log('error', err);
          }

          rateLimit[conn.id] -= 1;
      }
  });

  conn.on('close', function() {
      log('socket', chalk.underline(conn.id) + ': disconnected (' + clients[conn.id].ip + ')');
      utils.sendToAll(clients, {type:'typing', typing:false, user:clients[conn.id].un});
      utils.sendToAll(clients, {type:'server', info:'disconnection', user:users[clients[conn.id].id]});
      delete users[clients[conn.id].id];
      delete clients[conn.id];
  });
});


/* Functions */
function updateUser(id, name) {
  if(name.length > 2 && name.length < 17 && name.indexOf(' ') < 0 && !utils.checkUser(clients, name) && name.match(alphanumeric) && name != 'Console' && name != 'System') {
      if(clients[id].un == null) {
          clients[id].con.write(JSON.stringify({type:'server', info:'success'}));
          uid++;
      }

      users[clients[id].id].un = name;
      utils.sendToAll(clients, {
          type: 'server',
          info: clients[id].un == null ? 'connection' : 'update',
          user: {
              id: clients[id].id,
              oldun: clients[id].un,
              un: name,
              role: clients[id].role
          }
      });
      clients[id].un = name;
  } else {
      var motive = 'format';
      var check = false;

      if(!name.match(alphanumeric)) motive = 'format';
      if(name.length < 3 || name.length > 16) motive = 'length';
      if(utils.checkUser(clients, name) ||  name == 'Console' || name == 'System') motive = 'taken';
      if(clients[id].un != null) check = true;

      clients[id].con.write(JSON.stringify({type:'server', info:'rejected', reason:motive, keep:check}));
      if(clients[id].un == null) clients[id].con.close();
  }
}

function handleSocket(user, message) {
  var data = JSON.parse(message);

  data.id = user.id;
  data.user = user.un;
  data.type = s.escapeHTML(data.type);
  data.message = s.escapeHTML(data.message);
  data.mid = (Math.random() + 1).toString(36).substr(2, 5);

  switch(data.type) {
      case 'pm':
          if(data.extra != data.user && utils.checkUser(clients, data.extra)) {
              utils.sendToOne(clients, users, data, data.extra, 'message');
              data.subtxt = 'PM to ' + data.extra;
              utils.sendBack(clients, data, user);
          } else {
              data.type = 'light';
              data.subtxt = null;
              data.message = utils.checkUser(clients, data.extra) ? 'You can\'t PM yourself' : 'User not found';
              utils.sendBack(clients, data, user);
          }
          break;

      case 'global': case 'kick': case 'ban': case 'role':
          if(user.role > 0) {
              if(data.type == 'global') {
                  if(user.role == 3) {
                      return utils.sendToAll(clients, data);
                  } else {
                      data.subtxt = null;
                      data.message = 'You don\'t have permission to do that';
                      return utils.sendBack(clients, data, user);
                  }
              } else {
                  data.subtxt = null;
                  if(data.message != data.user) {
                      if(utils.checkUser(clients, data.message)) {
                          switch(data.type) {
                              case 'ban':
                                  var time = parseInt(data.extra);

                                  if(!isNaN(time) && time > 0) {
                                      if(user.role > 1 && utils.getUserByName(clients, data.message).role == 0) {
                                          for(var client in clients) {
                                              if(clients[client].un == data.message) {
                                                  bans.push([clients[client].ip, Date.now(), time * 1000 * 60]);
                                              }
                                          }

                                          data.extra = data.message;
                                          data.message = data.user + ' banned ' + data.message + ' from the server for ' + time + ' minutes';
                                          return utils.sendToAll(clients, data);
                                      } else {
                                          data.message = 'You don\'t have permission to do that';
                                          return utils.sendBack(clients, data, user);
                                      }
                                  } else {
                                      data.type = 'light';
                                      data.message = 'Use /ban [user] [minutes]';
                                      return utils.sendToOne(clients, users, data, data.user, 'message')
                                  }
                                  break;

                              case 'role':
                                  if(data.extra > -1 && data.extra < 4) {
                                      if(user.role == 3) {
                                          var role;
                                          data.role = data.extra;
                                          data.extra = data.message;

                                          if(data.role == 0) role = 'User';
                                          if(data.role == 1) role = 'Helper';
                                          if(data.role == 2) role = 'Moderator';
                                          if(data.role == 3) role = 'Administrator';
                                          data.message = data.user + ' set ' + data.message + '\'s role to ' + role;

                                          utils.sendToOne(clients, users, data, JSON.parse(message).message, 'role');
                                          utils.sendToAll(clients, {type:'server', info:'clients', clients:users});
                                      } else {
                                          data.message = 'You don\'t have permission to do that';
                                          return utils.sendBack(clients, data, user);
                                      }
                                  } else {
                                      data.type = 'light';
                                      data.message = 'Use /role [user] [0-3]';
                                      return utils.sendToOne(clients, users, data, data.user, 'message')
                                  }
                                  break;

                              case 'kick':
                                  if(user.role > 1 && utils.getUserByName(clients, data.message).role == 0) {
                                      data.extra = data.message;
                                      data.message = data.user + ' kicked ' + data.message + ' from the server';
                                  } else {
                                      data.message = 'You don\'t have permission to do that';
                                      return utils.sendBack(clients, data, user);
                                  }
                                  break;
                          }                            
                          utils.sendToAll(clients, data);
                      } else {
                          data.type = 'light';
                          data.message = 'User not found';
                          utils.sendBack(clients, data, user);
                      }
                  } else {
                      data.message = 'You can\'t do that to yourself';
                      utils.sendBack(clients, data, user);
                  }
              }
          } else {
              data.message = 'You don\'t have permission to do that';
              utils.sendBack(clients, data, user);
          }
          break;

      default:
          utils.sendToAll(clients, data);
          break;
  }
}



/* Internal */
if(config.readline.use) {
  readLine();
}

function readLine() {
  rl.on('line', function(line) {
      var data = {};
      if(line.indexOf('/role') == 0) {
          var string = 'Console gave ' + line.substring(6) + ' administrator permissions';

          data.message = string;
          data.user = 'Console';
          data.type = 'role';
          data.extra = line.substring(6);
          data.role = 3;

          utils.sendToAll(clients, data);
          utils.sendToOne(clients, users, data, line.substring(6), data.type);
      }

      rl.prompt();
  }).on('close', function() {
      log('stop', 'Shutting down\n');
      process.exit(0);
  });
}

if(!config.ssl.use) {
  var http = require('http');
  server = http.createServer(app);
} else {
  var https = require('https');
  var opt = {
      key: fs.readFileSync(config.ssl.key),
      cert: fs.readFileSync(config.ssl.crt)
  };

  server = https.createServer(opt, app);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if(error.syscall !== 'listen') {
      throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch(error.code) {
      case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;

      case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;

      default:
          throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  log('start', 'Listening at ' + bind);
}

chat.installHandlers(server, {prefix:'/socket', log:function(){}});
//end chat 




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var nav;
  res.render('errorcustom', {nav});
  // next(createError(404));
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

// app.listen(4000, () => console.log(`Example app listening on port ${4000}!`))

module.exports = app;