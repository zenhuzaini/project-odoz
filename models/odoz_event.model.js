var mongoose = require('mongoose');
var eventSchema = new mongoose.Schema({  
    event_title: {type: String, max:100 },
    event_date: String,
    event_time: String,
    event_description: String,
    event_fotopath: String,
    event_creator: String,
    event_status: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('odoz_event', eventSchema);  //odoz_article adalah collectionnya