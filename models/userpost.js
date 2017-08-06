var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserPostSchema = new Schema ({
	newIdea: String,
	budget: String,
	quotes: String,
	pictures: [String]
});

var UserPost = mongoose.model('UserPost', UserPostSchema);

module.exports = UserPost;