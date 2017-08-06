var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewDIYPostSchema = new Schema ({
	newIdea: String,
	budget: String,
	quotes: String,
	pictures: [String]
});

var NewDIYPost = mongoose.model('NewDIYPostSchema', NewDIYPostSchema);

module.exports = NewDIYPost;