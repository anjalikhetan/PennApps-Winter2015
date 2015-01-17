/**
 * Main Web route handling
 */

// We export the init() function to initialize
// our KVS values

exposts.init = function(callback) {
	res.render('signup');
	callback();
}
exports.index = function(req, res) {
	res.render('signup');
}