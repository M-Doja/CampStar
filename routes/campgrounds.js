const express     = require('express'),
      router      = express.Router(),
      passport    = require('passport'),
      flash       = require('connect-flash'),
      Campground  = require('../models/campground'),
      Mid         = require('../middleware/index');



// DISPLAY ALL CAMPGROUNDS
router.get('/', (req, res) => {
  console.log('getting campgrounds');
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
router.post('/', Mid.isLoggedIn, (req, res) => {
  console.log(req.body.images);
  var author = {username: req.user.username, id: req.user._id};
  var newCampground = {
    name: req.body.name,
    images: req.body.images,
    description: req.body.description,
    price: req.body.price,
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
router.get('/new', Mid.isLoggedIn, (req, res) => {
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

// EDIT CAMPGROUND
router.get('/:id/edit', Mid.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
    }else {
      res.render('campgrounds/edit', {campground: campground});
    }
  });
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', Mid.checkCampgroundOwnership, (req, res) => {
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
router.delete('/:id', Mid.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      res.redirec('/campgrounds');
    }else {
      res.redirect('/campgrounds')
    }
  });
});

// function Mid.isLoggedIn(req, res, next){
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// }

// function Mid.checkCampgroundOwnership(req, res, next){
//   if (req.isAuthenticated()) {
//     Campground.findById(req.params.id, (err, foundCampground) => {
//       if (err) {
//         req.flash('error', 'Unable to find that specific campground')
//         res.redirect('/campgrounds');
//       }else {
//         if (foundCampground.author.id.equals(req.user._id)) {
//           next();
//         }else {
//           req.flash('error', 'You don\'t have permission to do that')
//           res.render('campgrounds/edit', {campground: foundCampground});
//         }
//       }
//     });
//   }else {
//     req.flash('error', 'You need to be logged in to do that');
//     res.redirect('back');
//   }
// };

module.exports = router;
