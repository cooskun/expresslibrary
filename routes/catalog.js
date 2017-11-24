const express = require('express');
const router = express.Router();

//  Require controller modules
const book_controller = require('../controllers/bookController');
const author_controller = require('../controllers/authorController');
const genre_controller = require('../controllers/genreController');
const bookinstance_controller = require('../controllers/bookinstanceController');

///  BOOK ROUTES   ///

/*  GET catalog home page. */
router.get('/', book_controller.index);

/*  CREATE a Book. */
/* NOTE: This must come before routes that display Book (uses id) */
router.get('/book/create', book_controller.book_create_get);
router.post('/book/create', book_controller.book_create_post);

/*  DELETE a Book  */
router.get('/book/:id/delete', book_controller.book_delete_get);
router.post('/book/:id/delete', book_controller.book_delete_post);

//  UPDATE book
router.get('/book/:id/update', book_controller.book_update_get);
router.post('/book/:id/update', book_controller.book_update_post);

//  GET request for one Book
router.get('/book/:id', book_controller.book_detail);

//  GET request for list of all Books
router.get('/books', book_controller.book_list);


///  AUTHOR ROUTES   ///

/*  CREATE a Author. */
/* NOTE: This must come before route for id (i.e. display author) */
router.get('/author/create', author_controller.author_create_get);
router.post('/author/create', author_controller.author_create_post);

/*  DELETE a Author  */
router.get('/author/:id/delete', author_controller.author_delete_get);
router.post('/author/:id/delete', author_controller.author_delete_post);

//  UPDATE Author
router.get('/author/:id/update', author_controller.author_update_get);
router.post('/author/:id/update', author_controller.author_update_post);

//  GET request for one Author
router.get('/author/:id', author_controller.author_detail);

//  GET request for list of all Authors
router.get('/authors', author_controller.author_list);


///  GENRE ROUTES   ///

/*  CREATE a Genre. */
/* NOTE: This must come before route for id (i.e. display genre) */
router.get('/genre/create', genre_controller.genre_create_get);
router.post('/genre/create', genre_controller.genre_create_post);

/*  DELETE a Genre  */
router.get('/genre/:id/delete', genre_controller.genre_delete_get);
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

//  UPDATE Genre
router.get('/genre/:id/update', genre_controller.genre_update_get);
router.post('/genre/:id/update', genre_controller.genre_update_post);

//  GET request for one Genre
router.get('/genre/:id', genre_controller.genre_detail);

//  GET request for list of all Genres
router.get('/genres', genre_controller.genre_list);


///  BOOKINSTANCE ROUTES   ///

/*  CREATE a BookInstance. */
/* NOTE: This must come before route for id (i.e. display bookinstance) */
router.get('/bookinstance/create', bookinstance_controller.bookinstance_create_get);
router.post('/bookinstance/create', bookinstance_controller.bookinstance_create_post);

/*  DELETE a BookInstance  */
router.get('/bookinstance/:id/delete', bookinstance_controller.bookinstance_delete_get);
router.post('/bookinstance/:id/delete', bookinstance_controller.bookinstance_delete_post);

//  UPDATE BookInstance
router.get('/bookinstance/:id/update', bookinstance_controller.bookinstance_update_get);
router.post('/bookinstance/:id/update', bookinstance_controller.bookinstance_update_post);

//  GET request for one BookInstance
router.get('/bookinstance/:id', bookinstance_controller.bookinstance_detail);

//  GET request for list of all BookInstances
router.get('/bookinstances', bookinstance_controller.bookinstance_list);

//  Export Routes
module.exports = router;
