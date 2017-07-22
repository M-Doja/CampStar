const express     = require('express'),
      router      = express.Router(),
      passport    = require('passport'),
      flash       = require('connect-flash'),
      geocoder    = require('geocoder'),
      Campground  = require('../models/campground'),
      Mid         = require('../middleware/index');



// DISPLAY ALL CAMPGROUNDS
// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all campgrounds
router.get("/", function(req, res){
  if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({name: regex}, function(err, allCampgrounds){
         if(err){
            console.log(err);
         } else {
            res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
         }
      });
  } else {
      // Get all campgrounds from DB
      Campground.find({}, function(err, allCampgrounds){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allCampgrounds);
            } else {
              res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
            }
         }
      });
  }
});

// ADDING A NEW CAMPGROUND
router.post('/', Mid.isLoggedIn, (req, res) => {
  console.log(req.body.images);
  var encodedAddress = encodeURIComponent(req.body.location);
  geocoder.geocode(req.body.location, (err, data) => {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var author = {username: req.user.username, id: req.user._id};
    var newCampground = {
      name: req.body.name,
      images: req.body.images,
      description: req.body.description,
      price: req.body.price,
      author: author,
      location: location,
      locationStr: encodedAddress,
      lat: lat,
      lng: lng
    }
    console.log(newCampground);
    Campground.create(newCampground, (err, newSite) => {
      if (err) {
        console.log(err);
      }else {
        console.log('Newly created campsite');
        res.redirect('campgrounds');
      }
    });
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
router.put('/:id', (req, res) => {
  geocoder.geocode(req.body.location, (err, data) => {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var author = {username: req.user.username, id: req.user._id};
    var newCampground = {
      name: req.body.name,
      images: req.body.images,
      description: req.body.description,
      price: req.body.price,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    }
    Campground.findByIdAndUpdate(req.params.id, {$set: newCampground}, (err, campground) => {
      if (err) {
        console.log(err);
        res.redirect('/campgrounds');
      }else {
        res.redirect('/campgrounds/'+req.params.id)
      }
    });
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



module.exports = router;
