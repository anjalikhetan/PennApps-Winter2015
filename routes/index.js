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
	var userID = req.body.inputPhoneNumber;
	users.exists(userID, function(err, data) {
		if (data) {
			res.render('signup', {message: "Username exists, choose another"});
		} else {
			res.render('home');
		}

	});
}