var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pictures = require('./pictures.js')
var Supplies = require("./supplies.js");

var NewProjectSchema = new Schema ({
	newIdea: String,
	budget: Number,
	quotes: String,
	pictures: [Pictures.schema],
	supplies: [Supplies.schema]
});

var NewProject = mongoose.model('NewProject', NewProjectSchema);

module.exports = NewProject;