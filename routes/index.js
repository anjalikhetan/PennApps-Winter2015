/**
 * Main Web route handling
 */

// our tables
var users;
// We export the init() function to initialize
// our KVS values

// SHA-1 encryption
var sha1 = require('sha1');
var request = require('request');

exports.init = function(usrs, callback) {
	users = usrs;
	callback();
}
exports.signup = function(req, res) {
	res.render('signup', {message: null});
}

exports.signin = function(req, res) {
	res.render('signin', {message: null});
}

exports.validate = function(req, res) {
	var userID = req.body.inputPhoneNumber;
	users.exists(userID, function(err, data) {
		if (data) {
			users.get(userID, function(err, value) {
				var jsonvalue = JSON.parse(value);
				if (jsonvalue.password === sha1(req.body.password)) {
					res.redirect('home');
				} else {
					res.render('signin', {message: "Incorrect password, please try again."});
				}
			})
			//check to see if req.body.password matches the hashed password in the JSON obj.
		} else {
			res.render('signin', {message: "Username does not exist. Please sign up or try again."});
		}
	});
}

exports.createAccount = function(req, res) {
	// check database for existing username
	var userID = req.body.inputPhoneNumber;
	console.log("userID = " + userID);
	users.exists(userID, function(err, data) {
		if (data) {
			res.render('signup', {message: "Username already exists, please choose another."});
		} else {
			//New Phone Number
			console.log("This phone number is new to the table.");
			if (req.body.password1 === req.body.password2) {
				//The passwords do match
				var json = {phoneNumber: userID, 
						password: sha1(req.body.password1)};
				 /*Need to update the value object*/
				 console.log("passing var creation");

				users.put(userID, JSON.stringify(json), "0", function(err, data) {
					console.log(err);
					console.log("i'm putting " + userID + " " + JSON.stringify(json));
				});
				res.render('venmoVerify');
			} else {
				res.render('signup', {message: "Passwords do not match. Please try again."});
			}
		}

	});
}

exports.home = function(req, res) {
	res.render('home');
}

exports.venmoVerify = function(req, res) {
	res.render('venmoVerify');
}

exports.success = function(req, res) {
	request("https://api.venmo.com/v1/oauth/access_token", function (error, response, body) {
  		if (!error && response.statusCode == 200) {
   			 console.log(body) // Print the google web page.
	    }
	});
	res.redirect('home');
}