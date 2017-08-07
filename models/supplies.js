var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SupplySchema = new Schema ({
	supplyName: String,
	cost: Number
});

var Supply = mongoose.model('Supply', SupplySchema);

module.exports = Supply;