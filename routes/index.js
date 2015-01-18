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
					req.session.house = jsonvalue.house;
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
						password: sha1(req.body.password1),
						house: null,
						token: null};
				 /*Need to update the value object*/

				users.put(userID, JSON.stringify(json), "0", function(err, data) {
					console.log(err);
					console.log("i'm putting " + userID + " " + JSON.stringify(json));
				});
				req.session.number = req.body.inputPhoneNumber;
				res.redirect('joinHouse');
			} else {
				res.render('signup', {message: "Passwords do not match. Please try again."});
			}
		}

	});
}

exports.home = function(req, res) {
	if (req.session.number === undefined) {
		res.redirect('/');
	} else {

		houses.get(req.session.house, function(err, value) {
			var JSONvalue = JSON.parse(value);
		
			res.render('home',{name: JSONvalue.housename,
						       supplies: JSONvalue.supplies});
		});
	}
}

exports.success = function(req, res) {
	if (req.session.venmoCheck === undefined) {
		res.redirect('/');
	} else {
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
	   			 console.log(body);
	   			 users.get(req.session.number, function(err,value) {
	   			 	var JSONvalue = JSON.parse(value);
	   			 	JSONvalue.token = JSON.parse(body).access_token;
	   			 	users.put(req.session.number, JSON.stringify(JSONvalue), "0", function(err,data){

	   			 	});

	   			 });
		    }
		});
		res.redirect('home');
	}
}

exports.joinHouse = function(req, res) {
	console.log(req.session.number);
 	if (req.session.number === undefined) {
	 	res.redirect('/');
	} else {
		res.render('joinHouse', {message: null});
	}	
}

exports.joinExisting = function(req, res) {
	houses.exists(req.body.existingHouse, function(err,data) {
		if (!data) {
			res.render('joinHouse', {message: "The house name you entered does not exist. Please try again or create a new house."});
		} else {
			houses.get(req.body.existingHouse, function(err,value) {
				var JSONvalue = JSON.parse(value);
				JSONvalue.members.push(req.session.number);
				req.session.house = req.body.existingHouse;
				req.session.venmoCheck = true;
				users.get(req.session.number, function(err,val) {
					var JSONval = JSON.parse(val);
					JSONval.house = req.body.existingHouse;
					users.put(req.session.number, JSON.stringify(JSONval), "0", function(err,data) {
						console.log(err);
					});
				});
				houses.put(req.body.existingHouse, JSON.stringify(JSONvalue), "0", function(err,data){
					console.log(err);
				});
				res.redirect("https://api.venmo.com/v1/oauth/authorize?client_id=2258&scope=make_payments%20access_profile&response_type=code");
			});
		}
	});
}

exports.newHouse = function(req, res) {
	houses.exists(req.body.houseName, function(err,data) {
		if (data) {
			res.render('joinHouse', {message: "The house name you entered already exists. Please create a new name or join that house."});
		} else {
			var json = {housename: req.body.houseName,
						address: req.body.address,
						captainNumber: req.session.number,
						members: [req.session.number],
						supplies: []};
						console.log(req.session.number + "this is number");
			users.get(req.session.number, function(err,val) {
				var JSONval = JSON.parse(val);
				console.log(req.body.houseName);
				console.log(JSONval.house);
				JSONval.house = req.body.houseName;
				console.log('after' + " " + JSONval.house);
				users.put(req.session.number, JSON.stringify(JSONval), "0", function(err,data) {
					console.log(err);
				});
			});
			houses.put(req.body.houseName, JSON.stringify(json), "0", function(err,value) {	
				console.log(err);
				req.session.house = req.body.houseName;
				req.session.venmoCheck = true;			
				res.redirect("https://api.venmo.com/v1/oauth/authorize?client_id=2258&scope=make_payments%20access_profile&response_type=code");
			});
		}
	});
}
exports.addSupplies = function(req, res) {
	houses.get(req.session.house, function(err, value) {
		var JSONvalue = JSON.parse(value);
		JSONvalue.supplies.push(req.body.newSupply);
		houses.put(req.session.house, JSON.stringify(JSONvalue), "0", function(err,data){
			console.log(err);
			res.redirect('home');
		});	
	});
	
}

exports.checkoff = function(req, res) {
	houses.get(req.session.house, function(err, value) {
		var JSONvalue = JSON.parse(value);
		console.log(req.body);
		console.log("req.body.supply.length = " + req.body.supply.length);
		var arr = [].concat(req.body.supply);
		console.log("arr.length = " + arr.length);



		for (var i = 0; i < arr.length; i++) {
			var index = JSONvalue.supplies.indexOf(arr[i]);
			JSONvalue.supplies.splice(index,1);
		}

		houses.put(req.session.house, JSON.stringify(JSONvalue), "0", function(err,data) {
			res.redirect('home');
		});	
	});
}

exports.charge = function(req, res) {
	users.get(req.session.number, function(err,value) {
		var JSONvalue = JSON.parse(value);
		console.log(JSONvalue);
		request.post({
				url: "https://api.venmo.com/v1/payments", 
				form: {"access_token": JSONvalue.token,
			   		   "phone": JSONvalue.phoneNumber,
			    	   "note": "You will be charged by PennApps 2015",
			    	   "amount": -0.01
			    	}
			}, function (error, response, body) {
				console.log(error);
		  		console.log("response.statusCode = " + response.statusCode);
		  		console.log(response);
		  		console.log(body);
		  		if (!error && response.statusCode == 200) {
		   			 console.log(body);
			    }
			});
		res.redirect('home');
	});
}