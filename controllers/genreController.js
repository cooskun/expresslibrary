const Genre = require('../models/genre');
const Book = require('../models/book');

const async = require('async');
const debug = require('debug')('genre');

//  Display list of all Genres
exports.genre_list = function(req, res, next) {
  Genre.find()
    .sort([
      ['name', 'ascending']
    ])
    .exec(function(err, list_genre) {
      if (err) {
        return next(err);
      }
      //  Successfull, so render
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genre
      });
    });
}

//  Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {

  async.parallel({
      genre: function(callback) {
        Genre.findById(req.params.id)
          .exec(callback)
      },

      genre_books: function(callback) {
        Book.find({
            'genre': req.params.id
          })
          .exec(callback);
      },

    },

    function(err, results) {
      if (err) {
        return next(err);
      }
      //  Succesfull, so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books
      });
    });

};

//  Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
  res.render('genre_form', {
    title: 'Create Genre'
  });
};

//  Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {

  //  Check the field name is not empty
  req.checkBody('name', 'Genre name required').notEmpty();

  //  Trim and escape the name field
  req.sanitize('name').escape();
  req.sanitize('name').trim();

  //  Run the validators
  const errors = req.validationErrors();

  //  Create a genre object with escaped and trimmed data.
  const genre = new Genre({
    name: req.body.name
  });

  if (errors) {
    //  If there are errors render the form again, -->
    // -->  passing the previously entered values and errors
    res.render('genre_form', {
      title: 'Create Genre',
      genre: genre,
      errors: errors
    });
    return;
  }

  else {
    //  Data from form is valid
    //  Check if Genre with same name already exists
    Genre.findOne({
        'name': req.body.name
      })
      .exec(function(err, found_genre) {
        debug('found_genre : ' + found_genre);
        if (err) {
          return next(err);
        }

        if (found_genre) {
          //  Genre exists, redirect to its detail page
          res.render('genre_form', {
            title: 'Create Genre',
            genre: found_genre.name,
            warn: 'This genre has created already'
          });
        } 
        else {
          genre.save(function(err) {
            if (err) {
              return next(err);
            }
            //  Genre saved. Redirect to genre detail page
            res.redirect(genre.url);
          });
        }
      });
  }

};

//  Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {

  async.parallel({
      genre: function(callback) {
        Genre.findById(req.params.id)
          .exec(callback);
      },

      book: function(callback) {
        Book.find({ 'genre': req.params.id })
          .exec(callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }
      //  Succesfull, so render
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.book
      });
    });

};

//  Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {

  req.checkBody('genreid', 'Genre id must be exist').notEmpty();

  async.parallel({
    genre: function (callback) {
      Genre.findById( req.params.id )
        .exec(callback);
    },

    genre_books: function (callback) {
      Book.find({ 'genre': req.params.id })
        .exec(callback);
    }
  },

  function (err, results) {
    if (err) { return next(err); }
    //  Succes
    if (results.genre_books.length > 0) {
      res.render('genre_delete', {
        title: 'Genre Delete',
        genre: results.genre,
        genre_books: results.genre_books
      });
      return;
    }

    else {
      //  Genre has no books. Delete object and redirect to list of genres
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
        if (err) { return next(err); }
        //  Succes, got to genre list
        res.redirect('/catalog/genres');
      });
    }
  });

};

//  Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {
  Genre.findById(req.params.id)
    .exec(function (err, result) {
      if (err) { next(err); }

      res.render('genre_form', {
        title: 'Update Genre',
        genre: result
      });
    });
};

//  Handle Genre update on POST
exports.genre_update_post = function(req, res, next) {

  req.checkBody('name', 'Genre must be exist').notEmpty();

  const genre = new Genre({
    name: req.body.name,
    _id: req.params.id
  });

  const errors = req.validationErrors();
  if (errors) {
    Genre.findById(req.params.id)
      .exec(function (err, result) {
        if (err) { next(err); }

        res.render('genre_form', {
          title: 'Update Genre',
          genre: result,
          errors: errors
        });
      });
  }
  else {
    Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
      if (err) { next(err); }
      res.redirect(thegenre.url);
    })
  }

};
