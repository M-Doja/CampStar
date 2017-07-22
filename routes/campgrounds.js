const express     = require('express'),
      passport    = require('passport'),
      Campground  = require('../models/campground'),
      router      = express.Router();


// DISPLAY ALL CAMPGROUNDS
router.get('/', (req, res) => {
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
router.post('/', isLoggedIn, (req, res) => {
  console.log(req.body.pic);
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var newCampground = {
    name: req.body.name,
    images: req.body.pic,
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
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// RENDER SINGLE SITE ON PAGE
router.get('/:id', (req, res) => {
 Campground.findById(req.params.id).populate('comments').exec(( err, site) => {
   if (err) {
     console.log(err);
   }else {
     res.render('campgrounds/show', {campground: site})
   }
 });
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
