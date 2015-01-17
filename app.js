
var express = require('express');
var routes = require ('./routes');
var http = require('http');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.set('port', process.env.PORT || 8088);
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

routes.init(function() {
	app.get( '/', routes.index );

	http.createServer( app ).listen( app.get( 'port' ), function(){
		console.log( 'Open browser to http://localhost:' + app.get( 'port' ));
	} );
});