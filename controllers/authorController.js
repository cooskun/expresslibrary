const Author = require('../models/author');
const Book = require('../models/book');

const async = require('async');

//  Display list of all Authors
exports.author_list = function (req, res, next) {

  Author.find()
    .sort([[ 'family_name', 'ascending' ]])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      //  Succesfull, so render
      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors
      });
    })

}

//  Display detail page for a specific Author
exports.author_detail = function (req, res, next) {

  async.parallel({
    author: function (callback) {
      Author.findById(req.params.id)
        .exec(callback);
    },

    author_books: function (callback) {
      Book.find({ 'author': req.params.id }, 'title summary')
        .exec(callback);
    }
  },

  function (err, results) {
    if (err) { return next(err); }
    //  Succesfull, so render
    res.render('author_detail', {
      title: 'Author Detail',
      author: results.author,
      author_books: results.author_books
    });
  });

};

//  Display Author create form on GET
exports.author_create_get = function (req, res, next) {
  res.render('author_form', { title: 'Author Form' });
};

//  Handle Author create on POST
exports.author_create_post = function (req, res, next) {

  req.checkBody('first_name', 'First name must be specified.').notEmpty();
  // ^^^  We will not force alphanumeric, because people might have spaces.
  req.checkBody('family_name', 'Family name must be specified').notEmpty();
  req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
  // req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isDate();
  // req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isDate();

  req.sanitize('first_name').escape();
  req.sanitize('family_name').escape();
  req.sanitize('first_name').trim();
  req.sanitize('family_name').trim();
  req.sanitize('date_of_birth').toDate();
  req.sanitize('date_of_death').toDate();

  const errors = req.validationErrors();

  const author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death
  });

  if (errors) {
    res.render('author_form', {
      title: 'Create Author',
      author: author,
      errors: errors
    });
    return;
  }
  else {
    //  Data from form is valid
    author.save(function (err) {
      if (err) { next(err); }
      //  Succesfull, redirect ato new author record
      res.redirect(author.url);
    });
  }

};

//  Display Author delete form on GET
exports.author_delete_get = function (req, res, next) {

  async.parallel({
    author: function (callback) {
      Author.findById(req.params.id)
        .exec(callback);
    },

    author_books: function (callback) {
      Book.find({ 'author': req.params.id })
        .exec(callback);
    }
  },

  function (err, results) {
    if (err) {
      return next(err);
    }
    //  Succesfull, so render
    res.render('author_delete', {
      title: 'Delete Author',
      author: results.author,
      author_books: results.author_books
    });
  });

};

//  Handle Author delete on POST
exports.author_delete_post = function (req, res, next) {

  req.checkBody('authorid', 'Author id must exist').notEmpty();

  async.parallel({
    author: function (callback) {
      Author.findById(req.params.id).exec(callback);
    },

    author_books: function (callback) {
      Book.find({ 'author': req.params.id }).exec(callback);
    }
  },
  function (err, results) {
    if (err) { return next(err); }
    //  Succes
    if (results.author_books.length > 0) {
      //  Author has books. Render in same way as for GET route.
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        author_books: results.author_books
      });
      return;
    }

    else {
      //  Author has no books. Delete object and redirect to the list of authors
      Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
        if (err) { return next(err); }
        //  Succes - got to author list
        res.redirect('/catalog/authors');
      });
    }
  });

};

//  Display Author update form on GET
exports.author_update_get = function (req, res, next) {

  Author.findById(req.params.id)
    .exec(function (err, result) {
      if (err) { return next(err); }
      res.render('author_form', {
        title: 'Update Author',
        author: result
      });
    });

};

//  Handle Author update on POST
exports.author_update_post = function (req, res, next) {

  req.sanitize('first_name').escape();
  req.sanitize('family_name').escape();

  req.checkBody('first_name', 'First name must be exist').notEmpty();
  req.checkBody('family_name', 'Last name must be exist').notEmpty();
  req.checkBody('date_of_birth', 'Wrong format').toDate();
  req.checkBody('date_of_death', 'Wrong format').toDate();

  const author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
    _id : req.params.id
  });

  const errors = req.validationErrors();

  if (errors) {
    Author.findById(req.params.id)
      .exec(function (err, result) {
        if (err) { return next(err); }
        res.render('author_form', {
          title: 'Update Author',
          author: result
        });
      });
  }
  else {
    Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
      if (err) { return next(err); }
      res.redirect(theauthor.url);
    });
  }

};
