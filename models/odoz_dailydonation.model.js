var mongoose = require('mongoose');
var DailyDonationSchema = new mongoose.Schema({  
    member_mail : {type: String, max:100 },
    ddonation_date : String,
    ddonation_transactionID : String,
    ddonation_amount : String
});

module.exports = mongoose.model('odoz_dailydonation', DailyDonationSchema);  //odoz_dailydonationadalah collectionnya