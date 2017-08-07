var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var NewProject = require('./newproject.js');

var User = mongoose.Schema({
  local : {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    address: String,
    city: String,
    state: String
    //userprojects: [NewProject.schema]
  }
});

User.methods.hash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
 };

module.exports = mongoose.model('User', User);