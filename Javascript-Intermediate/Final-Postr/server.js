let helmet = require('helmet') //secures express apps
    , express = require('express')
    , routes  = require('./routes')
	, app = express()
	, user = require('./routes/user')
	, db = require('./models')
	, http    = require('http')
	, passport = require('passport')
	, passportConfig = require('./config/passport')
	, home = require('./routes/home')
	, application = require('./routes/application')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , cookieSession = require('cookie-session')


// Pull in the public directory
app.use('/public', express.static(__dirname + '/public'));

// Set Views folder
app.set('views', __dirname + '/views')

// Configuration for BCrypt Salt Work Factor
SALT_WORK_FACTOR = 12

// configuration
app.set('port', process.env.PORT || 8080)
//app.use(express.urlencoded())
//app.use(bodyParser());
app.use(cookieParser()) //.use(express.urlencoded)
app.use(cookieSession({
	secret: 'horsebatterystables',
	//cookie: {httpOnly: true,  secure: true}
}));


app.use(cookieSession({secret: 'app_1'}));

app.use(helmet());
app.use(function(req, res, next){
   res.setHeader("Pragma", "no-cache");
   res.setHeader("Expires", "0");
 	next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router)

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler())
}

//routes
app.get('/', routes.index)
app.get('/home', application.IsAuthenticated, home.homepage)
app.get('/account', application.IsAuthenticated, home.account)
app.post('/account/update', application.IsAuthenticated, user.update)
app.post('/authenticate',
	passport.authenticate('local',
		{
		   successRedirect: '/home',
		   failureRedirect: '/'
		}
));
app.get('/logout', application.destroySession)
app.get('/signup', user.signUp)
app.post('/register', user.register)
app.get('/search', application.IsAuthenticated, home.search)

db
  .sequelize
  .sync()
  .complete(function(err) {
    if (err) {
      //throw err[0]
    } else {
		db.User.find({where: { username: 'admin'} }).success(function (user) {
			if (!user) {
		 		db.User.build({ username: "admin", password: "admin" }).save();
		 	};
		});

      http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'))
      })
    }
  })
