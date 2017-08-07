var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PictureSchema = new Schema ({
	url: String
});

var Picture = mongoose.model('Picture', PictureSchema);

module.exports = Picture;