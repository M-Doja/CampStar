var mongoose = require('mongoose');

// SCHEMA
var campgroundSchema = new mongoose.Schema({
  name: String,
  images: String,
  description: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comments'
    }
  ],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
});
module.exports = mongoose.model('Campground', campgroundSchema);
