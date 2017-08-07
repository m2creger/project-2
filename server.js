
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
var methodOverride = require("method-override");
var Yelp = require("yelp");

// Current Project
var currentProject = "";
var currentUser = "";

var db = require("./models")
var userAuth = require("./controllers/users.js");
app.use(morgan('dev')); 
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('views', './views');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'WDI-GENERAL-ASSEMBLY-EXPRESS' }));  
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 
app.use(methodOverride("_method"))



require('./config/passport')(passport);

app.use(function (req, res, next) {
	//console.log(currentUser);
	res.locals.currentUser = req.user;
	//console.log(currentUser);
	next();

});

var photoResults = [];

// Home Page
app.get('/', function(req, res) {
	res.render("index");
});

// ************start new project**********/
app.get('/newproject', userAuth.authorized, function(req, res) {
	
	res.render("newproject");
});

// ************ Add project details ******/
app.get('/projectdetails', function(req, res) {
	console.log(req.params.id);
	res.render("projectdetails");
})
// ** add supplies to project ******
app.get('/addsupplies', function(req, res) {
	res.render('addsupplies');
});

// ****Post supplies to project *****/
app.post('/supplyadd', function(req, res) {
	var supply = req.body.supplies;
	var cost = req.body.cost;
	var newSupply = new db.Supply ({
		supplyName: supply,
		cost: cost
	});
	console.log("The current project in post supplies is " + currentProject);
	db.NewProject.findOne({_id: currentProject}, function(err, project) {
		console.log(project);
		if(err) {
			console.log(err)
		} else {
			project.supplies.push(newSupply);
			project.save();
			res.render('suppliesdone');
		}
	})
	
})

// ***** Search flickr********
//********************************
app.get("/flicksearch", function(req, res) {
	res.render("flicksearch");
});

app.get('/flickresults', function(req, res) {
	console.log(req.body);
	var searchTerm = req.query.search;
	searchTerm = searchTerm.replace(" ", "+");
	console.log(searchTerm);
	var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickr.apiKey + "&text=" + searchTerm +"&format=json&nojsoncallback=1";
	console.log(url);
	console.log("the flickr key is " +  flickr.apiKey);
	request(url, function(error, response, body) {
		if(error) {
			console.log("Something went wrong");
			console.log("error");
		} else {
			if(response.statusCode == 200) {
				var data = JSON.parse(body).photos.photo;
				data.forEach(function(picture) {
					// Get the data from picture
					var farm = picture.farm;
					var server = picture.server;
					var photoID = picture.id;
					var secret = picture.secret;
					
					var newPhotoURL = "https://farm" + farm + "." + "staticflickr.com/" + server+ "/" + photoID + "_"  + secret + ".jpg";
					//console.log("New photo url");
					//console.log(newPhotoURL);
					photoResults.push(newPhotoURL);
					
				});
				//console.log(photoResults);
				
				res.render("flickresults", {photoResults: photoResults});
				//console.log(data);
				//res.send(results["photos"]);
				//res.render("results", {data: data});
				photoResults.length = 0;
				console.log("Current photo results are " + photoResults);
			}
		}
	})
});

// ***** Search yelp********
//********************************

app.get('yelpsearch', function(req, res) {
	res.render("flicksearch");
});

app.get('yelpresults', function(req, res) {

})

// ******** Get all projects for user ********/

app.get("/projects", userAuth.authorized, function(req, res) {
	console.log("the user is" + req.user);
	currentUser = req.user;
	console.log("The current user is " + currentUser);
	db.NewProject.find({}, function(err, posts) {
		if(err) {
			console.log(err)
		} else {
			console.log("All of the posts are" + posts);
			res.render('projectlist', {posts: posts});
			//{posts: posts, currentUser: req.user}
		}
	})
})

//*******  New project post ********/
app.post('/projects', userAuth.authorized, function(req, res) {
	console.log(req.body);
	var newIdea = req.body.newIdea;
	var budget = req.body.budget;
	console.log(newIdea);
	//console.log(budget);
	// var newProjectIdea = new db.NewProject ({
	// 	newIdea: newIdea,
	// 	budget: budget
	// });
	var newProjectIdea = {
		newIdea: newIdea,
		budget: budget
	};
	
	console.log(newProjectIdea);
	console.log("The current user is " + currentUser);
	// db.User.findById({_id: currentUser}, function(err, user) {
	// 	console.log("found user" + user);
	// 	if(err) {
	// 		console.log(err);
	// 	} else {
	// 		user.userprojects.push(newProjectIdea);
			
	// 		res.render("projectdetails");
	// 	}
	// })
	db.NewProject.create(newProjectIdea, function(err, newpost) {
		if(err) {
			console.log(err);
		} else {
			currentProject = newProjectIdea._id;
			console.log("The current project is " + currentProject);
			console.log("The new project post is " + newpost);
			res.render("projectdetails", currentProject);
		}
	});
	
});

// ********* edit project *******/

app.get("/editproject/:id", userAuth.authorized, function(req, res) {
	var projectId = req.params.id;
	currentProject = projectId;
	console.log(currentProject);
	db.NewProject.findById({_id: projectId}, function(err, foundProject) {
		
		console.log(foundProject);
		res.render("updateproject", {project: foundProject});
	});
});

app.put("/editproject/:id", userAuth.authorized, function(req, res) {
	console.log(req.body.project);
	var updatedCost = req.body.cost;
	var updatedBudget = req.body.budget;
	db.NewProject.findByIdAndUpdate({_id: req.params.id}, req.body.project, function(err, foundProject) {
		console.log("Found project to update" + foundProject);
		if(err) {
			console.log(err);
		} else {
			res.render('projectlist');
		}
	})
});

// Add picture to database
app.get("/addpicture", function(req, res) {
	res.render("flicksearch");
})
app.post("/addpicture", function(req, res) {
	var pictureURL = req.body.name;

	var newPicture = new db.Picture({
		url: pictureURL 
	});
	console.log(newPicture);
	db.NewProject.findById({_id: currentProject}, function(err, project) {
		console.log("The current project is " + project);
		if(err) {
			console.log(err);
		} else {
			project.pictures.push();
			project.save();
			res.json(project);
		}
	})
});

// ****** Delete project ******** //
app.delete("/deleteproject/:id", function(req, res) {
	db.NewProject.findByIdAndRemove({_id: req.params.id}, function(err, deletedProject) {
		console.log("found project to remove" + deletedProject);
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});	

var routes = require('./config/routes');

app.use(routes);

app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});