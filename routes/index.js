/**
 * Main Web route handling
 */

// our tables
var users;
var houses
// We export the init() function to initialize
// our KVS values

// SHA-1 encryption
var sha1 = require('sha1');
var request = require('request');
var venmoCredentials = require('../config2');

exports.init = function(usrs, hses, callback) {
	houses = hses;
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
					req.session.number = req.body.inputPhoneNumber;
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

				users.put(userID, JSON.stringify(json), "0", function(err, data) {
					console.log(err);
					console.log("i'm putting " + userID + " " + JSON.stringify(json));
				});
				req.session.number = req.body.inputPhoneNumber;
				res.redirect("https://api.venmo.com/v1/oauth/authorize?client_id=2258&scope=make_payments%20access_profile&response_type=code");
			} else {
				res.render('signup', {message: "Passwords do not match. Please try again."});
			}
		}

	});
}

exports.home = function(req, res) {
	res.render('home');
}

exports.success = function(req, res) {
	console.log("req.query.code = " + req.query.code);
	request.post({
		url: "https://api.venmo.com/v1/oauth/access_token", 
		form: {"client_id": venmoCredentials.ID,
	   		   "client_secret": venmoCredentials.Secret,
	    	   "code": req.query.code
			  }
	}, function (error, response, body) {
  		console.log("response.statusCode = " + response.statusCode);
  		if (!error && response.statusCode == 200) {
   			 console.log(body) // Print the google web page.
	    }
	});
	res.redirect('joinHouse', {message: null});
}

exports.joinHouse = function(req, res) {
	res.render('joinHouse', {message: null});
}

exports.joinExisting = function(req, res) {
	houses.exists(req.body.existingHouse, function(err,data) {
		if (!data) {
			res.render('joinHouse', {message: "The house name you entered does not exist. Please try again or create a new house."});
		} else {
			houses.get(req.body.existingHouse, function(err,value) {

				res.redirect('home');
			});
		}
	});
}

exports.newHouse = function(req, res) {
	houses.exists(req.body.newHouse, function(err,data) {
		if (!data) {
			res.render('joinHouse', {message: "The house name you entered already exists. Please create a new name or join that house."});
		} else {
			var json = {housename: req.body.newName,
						address: req.body.address,
						captainNumber: req.session.number,
						members: req.session.number};

			houses.put(req.body.newHouse, JSON.stringify(json), "0", function(err,value) {
				
				res.redirect('home');
			});
		}
	});
	//do this after the new house is successfully created in the table
	res.render('home');
}
exports.addSupplies = function(req, res) {

}

exports.checkoff = function(req, res) {

}