const middleWareObj = {},
      Campground    = require('../models/campground'),
      Comments      = require('../models/comment');

middleWareObj.checkCampgroundOwnership = function(req, res, next){
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        req.flash('error', 'Unable to find that specific campground')
        res.redirect('/campgrounds');
      }else {
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        }else {
          req.flash('error', 'You don\'t have permission to do that')
          res.render('campgrounds/edit', {campground: foundCampground});
        }
      }
    });
  }else {
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('back');
  }
};

middleWareObj.checkCommentOwnership = function(req, res, next){
  if (req.isAuthenticated()) {
    Comments.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        res.redirect('/campgrounds');
      }else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        }else {
          req.flash('error', 'You don\'t have permission to do that');
          res.render('campgrounds/edit', {campground: foundComment});
        }
      }
    });
  }else {
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('back');
  }
};

middleWareObj.isLoggedIn = function(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to do that');
  res.redirect('/login');
};


module.exports = middleWareObj
