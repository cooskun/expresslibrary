const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const async = require('async');
const debug = require('debug')('book');

exports.index = function(req, res) {

  async.parallel({
    book_count: function(callback) {
      Book.count(callback);
    },
    book_instance_count: function(callback) {
      BookInstance.count(callback);
    },
    book_instance_available_count: function(callback) {
      BookInstance.count({
        status: 'Available'
      }, callback);
    },
    author_count: function(callback) {
      Author.count(callback);
    },
    genre_count: function(callback) {
      Genre.count(callback);
    },
  }, function(err, results) {
    res.render('index', {
      title: 'Local Library Home',
      error: err,
      data: results
    });
  });
};

//  Display list of all Books
exports.book_list = function(req, res, next) {

  Book.find({}, 'title author')
    .populate('author')
    .exec(function(err, list_books) {
      if (err) {
        return next(err);
      }
      // Succesfull, so render
      res.render('book_list', {
        title: 'Book List',
        book_list: list_books
      });
    });

}

//  Display detail page for a specific Book
exports.book_detail = function(req, res, next) {

  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },

    book_instance: function(callback) {
      BookInstance.find({
          'book': req.params.id
        })
        //  .populate book
        .exec(callback);
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    //  Succesfull, so render
    res.render('book_detail', {
      title: 'Title',
      book: results.book,
      book_instances: results.book_instance
    });
  });

};

//  Display Book create form on GET
exports.book_create_get = function(req, res, next) {

  async.parallel({
      authors: function(callback) {
        Author.find(callback);
      },

      genres: function(callback) {
        Genre.find(callback);
      }
    },

    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres
      });

    });

};

//  Handle Book create on POST
exports.book_create_post = function(req, res, next) {

  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();

  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre 
  });

  debug('BOOK : ' + book);

  const errors = req.validationErrors();

  if (errors) {
    //  There is some problems, so we need to re-render our book

    //  Get all authors and genres for form
    async.parallel({
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      }
    },

    function (err, results) {
      if (err) { return next(err); }

      //  Mark our selected genres as checked
      for (i=0; i < results.genres.length; i++) {
        if (book.genre.indexOf(results.genres[i]._id) > -1) {
          //  Current genre is selected. Set "checked" flag
          results.genres[i].checked = 'true';
        }
      }

      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres,
        book: book,
        errors: errors
      })
    }
  );
  }
  //  There is not any errors
  else {
    //  Data from form is valid
    //  We could check if book exists already, but lets just save


    book.save(function (err) {
      if (err) { return next(err); }
      //  Succesfull. Redirect to new book record
      res.redirect(book.url);
    });
  }

};

//  Display Book delete form on GET
exports.book_delete_get = function(req, res, next) {

  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },

    bookinstance: function (callback) {
      BookInstance.find({ book: req.params.id })
        .populate('book')
        .exec(callback);
    }
  },

  function (err, results) {
    if (err) { return next(err); }
    //  Succesfull, so render
    res.render('book_delete', {
      title: 'Delete Book',
      book: results.book,
      bookinstance: results.bookinstance
    });
  });

};

//  Handle Book delete on POST
exports.book_delete_post = function(req, res, next) {

  req.checkBody('bookid', 'Book id must be exist').notEmpty();

  Book.findByIdAndRemove(req.params.id, function (err) {
    if (err) { return next(err); }
    //  Everything went good, book has been deleted. Now send me book list
    res.redirect('/catalog/books');
  });

};

//  Display Book update form on GET
exports.book_update_get = function(req, res, next) {

  //  Get book, authors and genres for form
  async.parallel({
      book: function (callback) {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },

      authors: function (callback) {
        Author.find(callback);
      },

      genres: function (callback) {
        Genre.find(callback);
      }
  },

  function (err, results) {
    if (err) { return next(err); }
    res.render('book_form', {
      title: 'Update Book',
      authors: results.authors,
      genres: results.genres,
      book: results.book
    });
  });

};

//  Handle Book update on POST
exports.book_update_post = function(req, res, next) {

  //  Sanitize id passed id
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //  Check other data
  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();

  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();

  req.sanitize('genre').escape();

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: req.body.genre,
    _id: req.params.id
    // ^^^^-->  This is required, or a new ID will be assigned!
  });

  const errors = req.validationErrors();
  if (errors) {
    //  Re-render book with error information
    //  Get all authors and genres for form
    async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        }
    },

    function (err, results) {
      if (err) { return next(err); }
      //  Mark our selected genres as checked
      for (let i = 0; i < results.genres.length; i++) {
        if (book.genre.indexOf(results.genres[i]._id) > -1) {
          results.genres[i].checked = 'true';
        }
      }
      res.render('book_form', {
        title: 'Update Book',
        authors: results.authors,
        genres: results.genres,
        book: book,
        errors: errors
      });
    });
  }

  else {
    //  Data from form is valid. Update the record.
    Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
      if (err) { return next(err); }
      //  Succesfull, redirect to book default page
      res.redirect(thebook.url);
    });
  }

};
