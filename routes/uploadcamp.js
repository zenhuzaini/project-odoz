const multer = require('multer');
const path   = require('path');

const storageEngine = multer.diskStorage({
    destination: './public/files_campaign',
    filename: function(req, file, fn){
      fn(null,  new Date().getTime().toString()+'-'+file.fieldname+path.extname(file.originalname));
    }
  }); 

  //init

  const upload =  multer({
    storage: storageEngine,
    limits: { fileSize:3000000 },
    fileFilter: function(req, file, callback){
      validateFile(file, callback);
    }
  }).single('camp_fotopath'); //member_fotopath adalah untuk name yg di body


  var validateFile = function(file, cb ){
    allowedFileTypes = /jpeg|jpg|png|gif/;
    const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType  = allowedFileTypes.test(file.mimetype);
    if(extension && mimeType){
      return cb(null, true);
    }else{
      cb("Invalid file type. Only JPEG, PNG and GIF file are allowed.")
    }
  }
  module.exports = upload;