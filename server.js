
// Server setup
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var flickr = require('./env.js');
var zillow = require('./envzillow.js');

var db = require("./models")

app.use(morgan('dev')); 
app.use(cookieParser());
app.use(bodyParser()); 

app.set('views', './views');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'WDI-GENERAL-ASSEMBLY-EXPRESS' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 

require('./config/passport')(passport);

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

app.get('/', function(req, res) {
	res.render("flicksearch");
});

app.get("/flickresults", function(req, res) {
	request("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickr.apiKey + "&text=home+deck&format=json&nojsoncallback=1", function(error, response, body) {
		if(error) {
			console.log("Something went wrong");
			console.log("error");
		} else {
			if(response.statusCode == 200) {
				var data = JSON.parse(body);
				console.log(results);
				//res.send(results["photos"]);
				res.render("results", {data: data});
			}
		}
	})
});



var routes = require('./config/routes');
app.use(routes);

app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});