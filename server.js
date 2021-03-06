
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

var methodOverride = require("method-override");
var yelp = require("yelp-fusion");
var yelpClientId = process.env.yelpClientId || require('./env.js').yelpClientId;
var yelpSecretKey = process.env.yelpSecretKey || require('./env.js').yelpClientSecret
var flickApiKey = process.env.flickrKey || require('./env.js').flickrApiKey;
var flickSecretKey = process.env.flickrSecretKey || require('./env.js').flickrSecretKey;

// Current Project
var currentProject;
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

app.use(session({ secret: 'HOME AWESOMENESS' }));  
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


// ** add supplies to project ******
app.get('/addsupplies/:id', function(req, res) {
	// Get current user id
	var currentUserId = currentUser._id;
	var projectId = req.params.id;
	console.log("The current project is " + currentProject);

	// Find user by id
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
		} else {
			// Get all of user projects
			var userprojects = user.local.userprojects;
			console.log(userprojects);
			// find project that matches the project id
			var filteredObject = userprojects.filter(function(project){
				return project._id == projectId;
			})[0];
			console.log("**********THe filtered object in add supplies is " + filteredObject);
			// Show supplies page
			res.render("addsupplies", {project: filteredObject} );
		}
	})
});

// Show supplies on the project

app.get('/showsupplies/:id', function(req, res) {
	// Get user id
	var currentUserId = currentUser._id;
	var projectId = req.params.id;
	console.log("The current project is " + currentProject);
	// Find user by id
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
		} else {
			// find all of the user projects
			var userprojects = user.local.userprojects;
			console.log("The user's current projects supplies are " + userprojects.supplies);

			// find project that matches the project id
			var filteredObject = userprojects.filter(function(project){
				return project._id == projectId;
			})[0];
			console.log("**********THe filtered object in add supplies is " + filteredObject);
			var projectSupplies = filteredObject.supplies;
			console.log("************Showing supplies");
			console.log(projectSupplies);
			// Show the project supplies
			res.render("showsupplies", {supplies: projectSupplies});
		}
	})
})

// ***** Show project pictures
app.get('/showprojectpictures/:id', function(req, res) {
	console.log("******************* showing pictures")
	// Get project id and current id
	var projectId = req.params.id;
	var currentUserId = currentUser._id;
	// Find user by current id
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {
			// get all user projects
			var userprojects = user.local.userprojects;
			console.log(userprojects);
			// find project that matches current projects id
			var filteredObject = userprojects.filter(function(project){
				return project._id == projectId;
			})[0];
			console.log("**********THe filtered object is " + filteredObject);
			var pictures = filteredObject.pictures;
			console.log(pictures)
			// show current projects pictures
			res.render("projectpictures", {pictures: pictures})
		
		}
	})
})

// ****Post supplies to project *****/
app.put('/supplyadd/:id', function(req, res) {
	// get current projects id
	var projectId = req.params.id;
	console.log("The project id is " + projectId);
	// get current users id
	var currentUserId = currentUser._id;
	// supplies user added
	var supply = req.body.supplies;
	console.log("The supply is " + supply);
	// cost user added
	var cost = req.body.cost;
	console.log("The supply cost is " + cost);
	// Create new supply
	var newSupply = new db.Supply ({
		supplyName: supply,
		cost: cost
	});
	console.log("the new supply is " + newSupply);
	console.log("The current project in post supplies is " + currentProject);
	
	// Find user by id
	db.User.findById({_id: currentUserId}, function(err, user) {
		console.log("found user: " + user);
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {

			// Get all the user projects
			var userprojects = user.local.userprojects;
			console.log(userprojects);
			// look for project that matches id
			var filteredObject = userprojects.filter(function(project){
				return project._id == projectId;
			})[0];
			console.log("**********THe filtered object is " + filteredObject);
			// Add supply to supplies
			filteredObject.supplies.push(newSupply);
			// save supply to current project
			user.save(function (err, project) {
	            if (err) {
	                console.log(err)
	            } else {

	            	res.redirect("/projects");
	            }
        	});
		
		}
	})
	
})

// ***** Search flickr********
//********************************
app.get("/flicksearch", function(req, res) {
	res.render("picturesearch");
});

app.get('/flickresults', function(req, res) {
	console.log("the flickr api key is " + flickApiKey)
	var photoResults = [];
	console.log(req.body);
	var searchTerm = req.query.search;
	// search if the user put in a search term
	if (searchTerm) {
			searchTerm = searchTerm.replace(" ", "+");
			console.log(searchTerm);
			var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickApiKey + "&text=" + searchTerm +"&format=json&nojsoncallback=1";
			request(url, function(error, response, body) {
				console.log("The flickr results body is " + body);
				if(error) {
					//console.log("Something went wrong");
					
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
							// construct url
							var newPhotoURL = "https://farm" + farm + "." + "staticflickr.com/" + server+ "/" + photoID + "_"  + secret + ".jpg";
							
							photoResults.push(newPhotoURL);
							
						});
						
						res.render("flickresults", {photoResults: photoResults, project: currentProject});
						
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
	// get the results from user input
	var searchTerm = req.query.search;
	var location = req.query.location;
	console.log("the search term is " + searchTerm);
	console.log("the location is " + location);
	var yelpResultsParse;

	businessResults = [];
	var yelpBusinesses = [];
	console.log("getting yelp results");

 
  yelp.accessToken(yelpClientId, yelpSecretKey).then(response => {
  const client = yelp.client(response.jsonBody.access_token);
  // Search yelp
  client.search({
    term: searchTerm,
    location: location
  	}).then(response => {
  		var yelpResponseBody = response.body;
  		
  		yelpResultsParse = yelpParse(yelpResponseBody);
    	console.log("The yelp results parse is " + yelpResultsParse);
  			// businessResults.forEach(function(data) {
  			// 	var name = businessResults.name;
  			// 	console.log(name);
  			// })
  			
  		res.render('yelpresults', { businesses: yelpResultsParse});
		})
	}).catch(e => {
	  console.log(e);
   	});
   	
 	//res.render('tempyelpresults');
	
		
});

// Display yelp results

function yelpParse(yelpResults) {
	var yelpResultsArray = [];
	var yelpArray = JSON.parse(yelpResults);
	console.log(yelpArray);
	var yelpBusinesses = yelpArray.businesses;
	console.log("The yelp businesses are " + yelpBusinesses);
	for (var i = 0; i < yelpBusinesses.length; i++ ) {
		var name = yelpBusinesses[i].name;
		console.log(name);
		var city = yelpBusinesses[i].location.city;
		var state = yelpBusinesses[i].location.state;
		var phone = yelpBusinesses[i].phone;
		var rating = yelpBusinesses[i].rating;
		var imageURL = yelpBusinesses[i].image_url;

		// Create new business
		var newBusiness = {
			name: name,
			city: city,
			state: state,
			phone: phone,
			rating: rating,
			imageURL: imageURL
		}
		//console.log(newBusiness);
		yelpResultsArray.push(newBusiness);
	}
	//console.log(yelpResultsArray);
	
	return yelpResultsArray;
	//console.log(yelpResults);
}
// Still working on this item
app.get("/savecontractor", function(req, res) {
	currentUser = req.user;
	var currentUserId = currentUser._id;
	console.log("The current user is " + currentUser);
	res.render("savecontractor");
})

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
			res.redirect("/projects");
		}
	})

	
});

// ********* edit project *******/

app.get("/editproject/:id", userAuth.authorized, function(req, res) {
	var currentUserId = currentUser._id;
	console.log("**************Editing project");
	var projectId = req.params.id;

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

/********** Add pictures *********/
app.get("/addpicturestoproject/:id", function(req, res) {
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
			
			res.render("picturesearch", {project: currentProject});
			
		
		}
	})
})


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
	var pictureURL = req.body.url;
	console.log(pictureURL);
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
			var userPosts = user.local.userprojects;
			var filteredObject = userPosts.filter(function(project){
				return project._id == currentProject;
			})[0];
			console.log(user.local)
			var userphotos = filteredObject.pictures;
			console.log("******* The user photos are " + userphotos);
			// Add pictures to project
			userphotos.push(newPicture);
			
			user.save(function (err, project) {
	            if (err) {
	                console.log(err)
	            } else {
	            
	            	res.json(newPicture);
	            }
        	});
		
		}
	})

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

	            	res.redirect("/projects");
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