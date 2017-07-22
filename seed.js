var mongoose = require('mongoose'),
    Campground = require('./models/campground'),
    Comment = require('./models/comment');

var data = [
  {
    name: "cloud's rest",
    images: "http://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1443561122/CAMPING0915-Glacier-National-Park.jpg?itok=6gQxpDuT",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    name: "desert mesa",
    images: "https://images3.cosmopolitan.ru/upload/img_cache/89a/89a74a38f7f250e8f7608e357e1ded18_fitted_740x0.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    name: "canyon floor",
    images: "http://www.adirondackalmanack.com/wp-content/uploads/2014/05/IMG_0303.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  }
];

function seedDB(){
  Campground.remove({}, (err) => {
    if (err) {
      console.log(err);
    }
    console.log('removed campgrounds');
    Comment.remove({}, (err) => {
      if (err) {
        console.log(err);
      }
    data.forEach(function(seed){
      Campground.create(seed, function(err, campsite){
        if (err) {
          console.log(err);
        }else {
          console.log(`added a campground`);
          Comment.create(
            {
              text: "blah blah blah",
              author: "Joe Blow"
            }, function(err, comment){
              if (err) {
                console.log(err);
              }else {
                campsite.comments.push(comment);
                campsite.save();
              }
            })
        }
      });
    });
  });
})
}

module.exports = seedDB;
