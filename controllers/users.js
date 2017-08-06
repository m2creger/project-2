var passport = require("passport")

// GET /signup
function getSignup(req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage') });
}

// POST /signup
function postSignup(req, res, next) {
	console.log("postSignup");
    var signupStrategy = passport.authenticate('local-signup', {
      successRedirect : '/',
      failureRedirect : '/signup',
      failureFlash : true
    });

    return signupStrategy(req, res, next);
}

// GET /login
function getLogin(req, res) { 
  res.render('login.ejs', { message: req.flash('loginMessage') });
}

// POST /login 
function postLogin(req, res, next) {
  var loginProperty = passport.authenticate('local-login', {
    successRedirect: '/projects',
    failureRedirect: '/login',
    failureFlash: true
  });
  return loginProperty(req, res, next);
}

// GET /logout
function getLogout(req, res) {
  req.logout();
  res.redirect('/');
}

// Authorized User page
function authorized(req, res){
  console.log("the user is" + req.user);
  // If the user is authenticated, then we continue the execution
    if (req.isAuthenticated()) return next();

    // Otherwise the request is always redirected to the home page
    res.redirect('/login');
}

module.exports = {
  getLogin: getLogin,
  postLogin: postLogin ,
  getSignup: getSignup,
  postSignup: postSignup,
  getLogout: getLogout,
  authorized: authorized
}