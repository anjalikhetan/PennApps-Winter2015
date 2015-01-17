/**
 * Main Web route handling
 */

// We export the init() function to initialize
// our KVS values

exports.init = function(callback) {
	callback();
}
exports.index = function(req, res) {
	res.render('signup');
}
exports.signin = function(req, res) {
	res.render('signin');
}