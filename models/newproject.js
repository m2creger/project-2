var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewProjectSchema = new Schema ({
	newIdea: String,
	budget: String,
	quotes: String,
	pictures: [String]
});

var NewProject = mongoose.model('NewProject', NewProjectSchema);

module.exports = NewProject;