const port                  = process.env.PORT || 5000,
      fs                    = require('fs')
      express               = require('express'),
      bodyParser            = require('body-parser'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      LocalStrategy         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      medthodOverride       = require('method-override'),
      Campground            = require('./models/campground'),
      Comments              = require('./models/comment'),
      User                  = require('./models/user'),
      seedDB                = require('./seed'),
      {ObjectID}            = require('mongodb'),
      app                   = express();


// seedDB();
mongoose.connect('mongodb://localhost:27017/yelpcamp', (err, db) => {
  if (err) {
    console.log(err);
  }
  console.log('Now connected to DB');
  db = db;
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(medthodOverride('_method'));
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

// ========================================
// CAMPGROUND ROUTES
// ========================================

app.get('/', (req, res) => {
  res.render('landing', {title: "Welcome!"});
});

// DISPLAY ALL CAMPGROUNDS
app.get('/campgrounds', (req, res) => {

  Campground.find({}, (err, allcampsites) => {
    if (err) {
      console.log(err);
      res.status(404)
    }else {
      console.log(allcampsites);
      res.render('campgrounds/index', {campgrounds: allcampsites, currentUser: req.user});
    }
  });
});


// ADDING A NEW CAMPGROUND
app.post('/campgrounds', isLoggedIn, (req, res) => {
  console.log(req.body.images);
  var author = {username: req.user.username, id: req.user._id};
  var newCampground = {
    name: req.body.name,
    images: req.body.images,
    description: req.body.description,
    author: author
  }
  Campground.create(newCampground, (err, newSite) => {
    if (err) {
      console.log(err);
    }else {
      console.log('Newly created campsite');
      res.redirect('campgrounds');
    }
  });
});

// RENDER CAMPGROUND ADD FORM
app.get('/campgrounds/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// RENDER SINGLE SITE ON PAGE
app.get('/campgrounds/:id', (req, res) => {
 Campground.findById(req.params.id).populate('comments').exec(( err, site) => {
   if (err) {
     console.log(err);
   }else {
     res.render('campgrounds/show', {campground: site})
   }
 });
});

// EDIT CAMPGROUND
app.get('/campgrounds/:id/edit', checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    res.render('campgrounds/edit', {campground: campground});
  });
});

// UPDATE CAMPGROUND ROUTE
app.put('/campgrounds/:id', (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    }else {
      res.redirect('/campgrounds/'+req.params.id)
    }
  });
});

// DELETE CAMPGROUND
app.delete('/campgrounds/:id', checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      res.redirec('/campgrounds');
    }else {
      res.redirect('/campgrounds')
    }
  });
});

// ========================================
// COMMENTS ROUTES
// ========================================

// COMMENT FORM ROUTE
app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, site) => {
    if (err) {
      console.log(err);
    } else {
      res.render('comments/new', {campground: site});
    }
  });
});

// ADD COMMENT ROUTE
app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      Comments.create(req.body.comments, (err, comment) => {
        if (err) {
          console.log(err);
        }else {
          comment.author.id = req.user.id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          res.redirect(`/campgrounds/${campground._id}`);
        }
      });
    }
  });
});

// ========================================
// USER ROUTES
// ========================================
// GET REGISTER FORM
app.get('/register', (req, res) => {
  res.render('register');
});

// SIGN UP
app.post('/register', (req, res) => {
  var newUser =  new User({username: req.body.username});
  User.register(newUser ,req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.render('register')
    }
    passport.authenticate('local')(req, res, function(){
      res.redirect('/campgrounds');
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

// SIGN UP
app.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}), (req, res) => {

});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkCampgroundOwnership(req, res, next){
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        res.redirect('/campgrounds');
      }else {
        // if (foundCampground.author.id == req.user._id) {
        if (req.user._id.equals(foundCampground.author.id)) {
          next();
        }else {
          res.render('campgrounds/edit', {campground: foundCampground});
        }
      }
    });
  }else {
    res.redirect('back');
  }
}

// app.get('*', (req, res) => {
//   res.render('landing', {title: "Welcome!"});
// });
app.listen(port, () => {
  console.log(`App now runnning on port ${port}`);
});
