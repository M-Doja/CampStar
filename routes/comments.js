const express     = require('express'),
      passport    = require('passport'),
      router      = express.Router({mergeParams: true}),
      Campground  = require('../models/campground'),
      Comments    = require('../models/comment');


// COMMENT FORM ROUTE
router.get('/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, site) => {
    if (err) {
      console.log(err);
    } else {
      res.render('comments/new', {campground: site});
    }
  });
});

// ADD COMMENT ROUTE
router.post('/', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      Comments.create(req.body.comments, (err, comment) => {
        if (err) {
          console.log(err);
        }else {
          comment.author.id = req.user._id;
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


function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
