const express     = require('express'),
      passport    = require('passport'),
      // Campground  = require('../models/campground'),
      // Comments    = require('../models/comment'),
      User        = require('../models/user'),
      router       = express.Router();

router.get('/', (req, res) => {
  res.render('landing', {title: "Welcome!"});
});

// ========================================
// USER ROUTES
// ========================================
// GET REGISTER FORM
router.get('/register', (req, res) => {
  res.render('register');
});

// SIGN UP
router.post('/register', (req, res) => {
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

router.get('/login', (req, res) => {
  res.render('login');
});

// SIGN UP
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}), (req, res) => {

});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
