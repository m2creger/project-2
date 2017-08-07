var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SupplySchema = new Schema ({
	supply: String,
	cost: Number
});

var Supply = mongoose.model('Supply', SupplySchema);

module.exports = Supply;