const port                  = process.env.PORT || 5000,
      fs                    = require('fs');

const express               = require('express'),
      bodyParser            = require('body-parser'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      LocalStrategy         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      medthodOverride       = require('method-override'),
      flash                 = require('connect-flash'),
      MongoClient           = require('mongodb').MongoClient;

const Campground            = require('./models/campground'),
      Comments              = require('./models/comment'),
      User                  = require('./models/user'),
      MONGO_DB              = require('./config/config'),
      seedDB                = require('./seed'),
      app                   = express();
const dbURI                 = MONGO_DB.DB_URI;

// seedDB();

// DATABASE CONNECTION
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/yelpcamp', (err, db) => {
mongoose.connect(dbURI, {
  useMongoClient: true
}, (err, db) => {
  if (err) {
    console.log(err);
  }
  console.log('Now connected to DB');
  db = db;
});

// EXPRESS MIDDLEWARE
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(medthodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');

app.use(require('express-session')({
  secret: "fuzzywuzzyorwashe",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});


// CREATE LOGGER
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) console.log('Error with server.log');
  });
   next();
});



var mainRoutes = require('./routes/index')
var campRoutes = require('./routes/campgrounds');
var commentRoutes = require('./routes/comments');


app.use('/', mainRoutes);
app.use('/campgrounds', campRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);


// app.get('*', (req, res) => {
//   res.render('landing', {title: "Welcome!"});
// });

app.listen(port, () => {
  console.log(`App now runnning on port ${port}`);
});
