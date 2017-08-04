var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserPostSchema = new Schema ({

});

var UserPost = mongoose.model('UserPost', UserPostSchema);

module.exports = UserPost;