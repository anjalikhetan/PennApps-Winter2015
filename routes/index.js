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
	// if username doesn't exist
	console.log("createAccount opened.");
	var userID = req.body.inputPhoneNumber;
	console.log("userID = " + userID);
	users.exists(userID, function(err, data) {

		if (data) {
			console.log("This phone number already existed.");
			res.render('signup', {message: "Username exists, choose another"});
		} else {
			console.log("This phone number is new to the table.");
			var json = {phoneNumber: userID};
			 /*Need to update the value object*/

			users.put(userID, JSON.stringify(json), 0, function(err, data) {
			});
			res.render('home');
		}

	});
}