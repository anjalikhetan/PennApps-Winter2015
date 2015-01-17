/**
 * Main Web route handling
 */

// We export the init() function to initialize
// our KVS values
exports.index = function(req, res) {
	res.render('signup');
}