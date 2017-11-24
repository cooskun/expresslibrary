const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: {
    type: String,
    min: 3,
    max: 100,
    required: true
  }
});

//  Virtual for genre's URL
GenreSchema
  .virtual('url')
  .get(function () {
    return '/catalog/genre/' + this._id;
  });

//  Export Model
module.exports = mongoose.model('Genre', GenreSchema);
