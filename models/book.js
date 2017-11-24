const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const BookSchema = Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: Schema.ObjectId,
    ref: 'Author',
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  genre: [
    {
      type: Schema.ObjectId,
      ref: 'Genre'
    }
  ]
});

//  Virtual for book's url
BookSchema
  .virtual('url')
  .get(function() {
    return '/catalog/book/' + this._id;
  });

//  Export model
module.exports = mongoose.model('Book', BookSchema);
