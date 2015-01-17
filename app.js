
var express = require('express');
var routes = require ('./routes');
var http = require('http');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.set('port', process.env.PORT || 8080);
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use( express.static( path.join( __dirname, 'public' )));

app.use(cookieParser());
app.use(session({secret: 'hardingm',
				saveUninitialized: true,
                resave: true}
));

var aws = require("./keyvaluestore.js");

var users = new aws('PAusers');
var houses = new aws('PAhouses');

users.init(function() {
	houses.init(function() {
		routes.init(users, houses, function() {
			app.get( '/', routes.signup);
			app.get('/signin', routes.signin);
			app.post('/createAccount', routes.createAccount);
			app.post('/validate', routes.validate);
			app.get('/home', routes.home);
			app.get('/success', routes.success);
			app.get('/joinHouse', routes.joinHouse);
			app.post('/addSupplies', routes.addSupplies);
			app.post('/checkoff', routes.checkoff);
			app.post('/joinExisting', routes.joinExisting);
			app.post('/newHouse', routes.newHouse);
			http.createServer( app ).listen( app.get( 'port' ), function(){
				console.log( 'Open browser to http://localhost:' + app.get( 'port' ));
			});
		});
	});
});