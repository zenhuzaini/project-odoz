var mongoose = require('mongoose');
var CampSchema = new mongoose.Schema({  
    camp_title: {type: String, max:100 },
    camp_date: String,
    camp_description: String,
    camp_fotopath: String,
    camp_creator: String,
    camp_status: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('odoz_campaign', CampSchema);  //odoz_article adalah collectionnya