var mongoose = require('mongoose');

var MemberSchema = new mongoose.Schema({ 
    member_name: {type: String, max:100 },
    member_country: {type: String},
    member_address: String,
    member_mail: String,
    member_password: String,
    member_fotopath: String,
    member_passwordconf: String,
    member_link: String,
    member_status: {
        type: Boolean,
        default: false
    },
    member_testimony: String
});

module.exports = mongoose.model('odoz_member', MemberSchema);  //odoz_member adalah collectionnya