/**
 * Main Web route handling
 */

// our tables
var users;
// We export the init() function to initialize
// our KVS values

exports.init = function(usrs, callback) {
	users = usrs;
	callback();
}
exports.signup = function(req, res) {
	res.render('signup', {message: null});
}

exports.signin = function(req, res) {
	res.render('signin');
}

exports.createAccount = function(req, res) {
	// check database for existing username
	var userID = req.body.inputPhoneNumber;
	console.log("userID = " + userID);
	users.exists(userID, function(err, data) {

		if (data) {
			res.render('signup', {message: "Username exists, choose another"});
		} else {
			console.log("This phone number is new to the table.");
			var json = {phoneNumber: userID};
			 /*Need to update the value object*/
			 console.log("passing var creation");

			users.put(userID, JSON.stringify(json), "0", function(err, data) {
				console.log(err);
				console.log("i'm putting " + userID + " " + JSON.stringify(json));
			});
			res.render('home');
		}

	});
}