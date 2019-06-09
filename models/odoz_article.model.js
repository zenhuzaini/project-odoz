var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({  
    article_title: {type: String, max:100 },
    article_date: String,
    article_description: String,
    article_image: String,
    article_creator: String,
    article_status: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('odoz_article', ArticleSchema);  //odoz_article adalah collectionnya