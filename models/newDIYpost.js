var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewDIYPostSchema = new Schema ({
	newIdea: String,
	budget: String,
	quotes: String,
	pictures: [String]
});

var NewDIY = mongoose.model('NewDIY', NewDIYPostSchema);

module.exports = NewDIY;