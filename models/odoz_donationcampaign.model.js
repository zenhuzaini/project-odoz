var mongoose = require('mongoose');
var DailyDonationSchema = new mongoose.Schema({  
    cdonation_mail : {type: String, max:100 },
    cdonation_name : {type: String, max:100 },
    cdonation_date : String,
    cdonation_transactionID : String,
    cdonation_amount : String,
    cdonation_id_camp : String
});

module.exports = mongoose.model('odoz_donationcampaign', DailyDonationSchema);  //odoz_dailydonationadalah collectionnya