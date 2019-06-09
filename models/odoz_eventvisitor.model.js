var mongoose = require('mongoose');

var EventVisitorSchema = new mongoose.Schema({ 
    visitor_name: {type: String, max:100 },
    visitor_mail: {type: String},
    event_id: String
});

module.exports = mongoose.model('odoz_eventvisitor', EventVisitorSchema);  //odoz_member adalah collectionnya