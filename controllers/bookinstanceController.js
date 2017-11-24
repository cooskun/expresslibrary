const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const async = require('async');
const debug = require('debug')('bookinstance');

//  Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
      if (err) {
        return next(err);
      }
      // Succesfull, so render
      debug('Here is list ' + list_bookinstances);
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances
      });
    });

}

//  Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if (err) {
        return next(err);
      }
      //  Succesfull, so render
      res.render('bookinstance_detail', {
        title: 'Book',
        bookinstance: bookinstance
      });
    });

};

//  Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {

  Book.find({}, 'title')
    .exec(function(err, books) {
      if (err) {
        return next(err);
      }
      //  Succesfull, so render
      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: books
      });
    });

};

//  Handle BookInstance create on POST
exports.bookinstance_create_post = function(req, res, next) {

  req.checkBody('book', 'Book must be specified').notEmpty();
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  // req.checkBody('due_back', 'Invalid Date').optional({
  //   checkFalsy: true
  // }).isDate();

  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();

  req.sanitize('book').trim();
  req.sanitize('imprint').trim();
  req.sanitize('status').trim();

  // req.sanitize('due_back').toDate();

  const bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back
  });

  const errors = req.validationErrors();

  if (errors) {

    Book.find({}, 'title')
      .exec(function(err, books) {
        if (err) {
          return next(err);
          //  Succesfull, so render
          res.render('bookinstance_form', {
            title: 'Create BookInstance',
            book_list: books,
            selected_book: bookinstance.book._id,
            errors: errors,
            bookinstance: bookinstance
          });
        }
      });
    return;

  }
  else {
    //  Data from form is valid
    bookinstance.save(function (err) {
      if (err) {
        return next(err);
      }
      //  Succesfull, redirect to new bookinstance record
      res.redirect(bookinstance.url);
    });
  }

};

//  Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if (err) {
        return next(err);
      }
      // Succesfull, so render
      res.render('bookinstance_delete', {
        title: 'Delete Bookinstance',
        bookinstance
      });
    });

};

//  Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, next) {

  req.checkBody('bookinstanceid', 'Bookinstance id must be exist').notEmpty();

  BookInstance.findByIdAndRemove(req.params.id, function (err) {
    if (err) { return next(err); }
    //  Succesfull, this record deleted. Now send me list of bookinstances
    res.redirect('/catalog/bookinstances');
  })

};

//  Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {

  async.parallel({
    bookinstance: function (callback) {
      BookInstance.findById(req.params.id)
        .populate('book')
        .exec(callback);
    },

    book_list: function (callback) {
      Book.find(callback);
    }
  },

  function (err, results) {
    if (err) { return next(err); }
    res.render('bookinstance_form', {
      title: 'Update Book Instance',
      bookinstance: results.bookinstance,
      book_list: results.book_list
    });
  });


};

//  Handle BookInstance update on POST
exports.bookinstance_update_post = function(req, res) {

  req.checkBody('book', 'Book must be exist').notEmpty();
  req.checkBody('imprint', 'Imprint must be exist').notEmpty();
  req.checkBody('status', 'Status must be exist').notEmpty();

  req.checkBody('due_back', 'Wrong format').toDate();

  const bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back,
    _id: req.params.id
  });

  const errors = req.validationErrors();

  if (errors) {
    BookInstance.findById(req.params.id)
      .populate('book')
      .exec(function (err, result) {
        if (err) { return next(err); }
        //  Succesfull, so render
        res.render('bookinstance_form', {
          title: 'Update Book Instance',
          bookinstance: result,
          errors: errors
        });
      });
  }
  else {
    BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
      if (err) { return next(err); }
      res.redirect(thebookinstance.url);
    });
  }


};
