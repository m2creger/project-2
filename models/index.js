var mongoose = require("mongoose");
mongoose.connect( process.env.MONGODB_URI || 
                  process.env.MONGOLAB_URI || 
                  process.env.MONGOHQ_URL || 
                  "mongodb://localhost/project-2");

module.exports.User = require("./user.js");
module.exports.NewProject = require("./newproject.js");
module.exports.Supply = require("./supplies.js");
module.exports.Picture = require("./pictures.js");