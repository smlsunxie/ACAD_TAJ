
/**
* Module dependencies.
*/

var express = require('express')
  , routes = require('./routes')
  , mongo = require('mongoskin')
  , db = mongo.db('guest:guest@staff.mongohq.com:10028/acad_taj?auto_reconnect=true&poolSize=5');

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    //session support
    //app.use(express.cookieParser());
    //app.use(express.session({ secret: "keyboard cat", store: new MongoDBStore({url: 'localhost', maxAge: 300000}) }));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

// Routes
app.get('/', routes.index);

// Load Services
require('./service')(app, db);

/*
 * process.env.PORT: Windows Azure, Cloud9, Heroku
 * process.env.VCAP_APP_PORT: Cloud Foundry
 * process.env.npm_package_config_port: package.json
 */
app.listen(process.env.PORT || process.env.VCAP_APP_PORT || process.env.npm_package_config_port || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
