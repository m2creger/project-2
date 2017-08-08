
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
var yelpCredentials = require('./envzillow.js');
var methodOverride = require("method-override");
var yelp = require("yelp-fusion");

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
	console.log("The current project is " + currentProject);
	var projectID = JSON.stringify(currentProject);
	res.render('addsupplies', {projectID: projectID});
});

// ****Post supplies to project *****/
app.put('/supplyadd/:id', function(req, res) {
	var supply = req.body.supplies;
	console.log("The supply is " + supply);
	var cost = req.body.cost;
	console.log("The supply cost is " + cost);
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
	var photoResults = [];
	console.log(req.body);
	var searchTerm = req.query.search;
	if (searchTerm) {
			searchTerm = searchTerm.replace(" ", "+");
			console.log(searchTerm);
			var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickr.apiKey + "&text=" + searchTerm +"&format=json&nojsoncallback=1";
			request(url, function(error, response, body) {
			if(error) {
				console.log("Something went wrong");
				
			} else {
				if(response.statusCode == 200) {
					var data = JSON.parse(body).photos.photo;
					console.log("*********Flickr data");
					console.log(data);
					
					data.forEach(function(picture) {
						// Get the data from picture
						var farm = picture.farm;
						var server = picture.server;
						var photoID = picture.id;
						var secret = picture.secret;
						
						var newPhotoURL = "https://farm" + farm + "." + "staticflickr.com/" + server+ "/" + photoID + "_"  + secret + ".jpg";
						
						photoResults.push(newPhotoURL);
						
					});
					
					res.render("flickresults", {photoResults: photoResults});
					
					photoResults.length = 0;
					
				}
			}
		})
	} else {
		res.redirect('/flicksearch');
	}
	
});

// ***** Search yelp********
//********************************

app.get('/yelpsearch', function(req, res) {
	res.render("yelpsearch");
});

app.get('/yelpresults', function(req, res) {
	businessResults = [];
	var yelpBusinesses = [];
	console.log("getting yelp results");

  yelp.accessToken(yelpCredentials.clientId, yelpCredentials.clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  client.search({
    term:'Starbucks',
    location: 'san francisco, ca'
  	}).then(response => {
  		console.log(response);
    		
  			// businessResults.forEach(function(data) {
  			// 	var name = businessResults.name;
  			// 	console.log(name);
  			// })
  			
  			
		});
	}).catch(e => {
	  console.log(e);
   });
 
	res.render('yelpresults');
		
});

// ******** Get all projects for user ********/

app.get("/projects", userAuth.authorized, function(req, res) {
	console.log("the user is" + req.user);
	currentUser = req.user;
	var currentUserId = currentUser._id;
	console.log("The current user is " + currentUser);

	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
		} else {
			var userPosts = user.local.userprojects;
			console.log("The user posts are " + userPosts);
			
			res.render("projectlist", {posts: userPosts} );
		}
	})
})

//*******  New project post ********/
app.post('/projects', userAuth.authorized, function(req, res) {
	console.log(req.body);
	var newIdea = req.body.newIdea;
	var budget = req.body.budget;
	console.log(newIdea);
	var newProjectIdea = new db.NewProject({
		newIdea: newIdea,
		budget: budget
	});
	
	console.log(newProjectIdea);
	var currentUserId = currentUser._id;
	console.log("The current user is " + currentUserId);
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
		} else {
			user.local.userprojects.push(newProjectIdea);
			currentProject = newProjectIdea._id;
			console.log("The current project is " + currentProject);
			user.save();
			res.render("projectdetails");
		}
	})

	
});

// ********* edit project *******/

app.get("/editproject/:id", userAuth.authorized, function(req, res) {
	var currentUserId = currentUser._id;
	console.log("**************Editing project");
	var projectId = req.params.id;
	currentProject = projectId;
	console.log("The id of the current project being edited is " + currentProject);
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {
			var userPosts = user.local.userprojects;
			var filteredObject = userPosts.filter(function(project){
				return project._id == projectId;
			})[0];
			res.render("updateproject", {project: filteredObject});
			
		
		}
	})
	
});

app.put("/editproject/:id", userAuth.authorized, function(req, res) {
	console.log("*****************updating project" );
	console.log(req.body.budget);
	var currentUserId = currentUser._id;
	var projectId = req.params.id;
	var updatedCost = req.body.budget;
	console.log("Updated cost is " + updatedCost);
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {
			var userPosts = user.local.userprojects;
			var filteredObject = userPosts.filter(function(project){
				return project._id == projectId;
			})[0];
			console.log("**********THe filtered object is " + filteredObject);
			filteredObject.budget = updatedCost;
			console.log(filteredObject.budget);
			
			user.save(function (err, project) {
	            if (err) {
	                console.log(err)
	            } else {

	            	res.redirect("/");
	            }
        	});
		
		}
	})
});

// Add picture to database

app.post("/addpicture", function(req, res) {
	var pictureURL = req.body.name;
	var currentUserId = currentUser._id;
	var newPicture = new db.Picture({
		url: pictureURL 
	});
	console.log("The new picture being added is " + newPicture);
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {
			var userphotos = user.local.userprojects.pictures;
			console.log("******* The user photos are " + userphotos);
			//userphotos.push(newPicture);
			
			user.save(function (err, project) {
	            if (err) {
	                console.log(err)
	            } else {

	            	res.redirect("/");
	            }
        	});
		
		}
	})
	// db.NewProject.findById({_id: currentProject}, function(err, project) {
	// 	console.log("The current project is " + project);
	// 	if(err) {
	// 		console.log(err);
	// 	} else {
	// 		project.pictures.push();
	// 		project.save();
	// 		console.log("project was saved");
	// 		res.json(project);
	// 	}
	// })
});

// ****** Delete project ******** //
app.delete("/deleteproject/:id", function(req, res) {
	console.log("*****************deleting project" );
	
	var currentUserId = currentUser._id;
	var projectId = req.params.id;

	
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {
			var userPosts = user.local.userprojects;
			var filteredObject = userPosts.filter(function(project){
				return project._id == projectId;
			})[0];
			console.log("**********THe filtered object is " + filteredObject);
			var index = userPosts.indexOf(filteredObject);
			userPosts.splice(index, 1);
			user.save(function (err, project) {
	            if (err) {
	                console.log(err)
	            } else {

	            	res.redirect("/");
	            }
        	});
		
		}
	})
});	

var routes = require('./config/routes');

app.use(routes);

app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});