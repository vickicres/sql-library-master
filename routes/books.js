const express = require('express');
const { Sequelize } = require('../models');
const router = express.Router();
//import the book model 
const Book = require('../models').Book; 
const Op = Sequelize.Op;
let search = '';



//Middleware handler 
function asyncHandler(callback){
  return async(req, res, next) => {
      try {
        await callback(req, res, next)
      } catch(error){ 
        res.status = 404;
        next(error);
      }
  }
}

/* GET all the books */
// router.get('/', asyncHandler(async (req, res) => {
//   // get all books from the library database
//   const books = await Book.findAll({ 
//     order: [[ 'title', 'ASC' ]]  // order by title
//   });
//   res.render("books/index", { books } );
// }));
router.get('/', asyncHandler(async (req, res) => {
  let page = req.query.page ? req.query.page - 1 : 0;

  const {rows, numberOfPages} = await queryBooks(search, page);
  if (page < 0 || page > numberOfPages) {
      res.status(404).render("books/page-not-found");
  }
  res.render("books/index", {books: rows, title: "Books", numberOfPages, search});
}));

/* GET pagination */
router.post("/", asyncHandler(async (req, res) => {
  let page = req.query.page ? req.query.page - 1 : 0;
  search = req.body.search ? req.body.search : '';

  const {rows, numberOfPages} = await queryBooks(search, page);
  res.render("books/index", {books: rows, title: "Books", numberOfPages, search});
}));

/* GET search */
async function queryBooks(search, page) {
  console.log(search, page);
  let booksPerPage = 6;
   let {count, rows} = await Book.findAndCountAll({
      where: {
          [Op.or]: [
              {
                  title: {
                      [Op.like]: `%${search}%`
                  }
              },
              {
                  author: {
                      [Op.like]: `%${search}%`
                  }
              },
              {
                  genre: {
                      [Op.like]: `%${search}%`
                  }
              },
              {
                  year: {
                      [Op.like]: `%${search}%`
                  }
              }
          ]
      },
      offset: page * booksPerPage,
      limit: booksPerPage
  });

  let numberOfPages = Math.ceil(count / booksPerPage);
  let queryData = {
      numberOfPages,
      rows: rows
  }
  return queryData;
}



/* GET create new book form */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {} });
});


/* POST Submits form and create a new book. */
router.post('/new', asyncHandler(async (req, res) => {
      let book;
      try {
        book = await Book.create(req.body);  
        res.redirect("/books/" + book.id);   
      } catch (error) {
        if(error.name === "SequelizeValidationError") {
          book = await Book.build(req.body);
          res.render("books/form-error", { book, errors: error.errors})
        } else {
          throw error; 
        }
      }

  }));


/* GET /books/:id - Shows more details from the book. */
router.get('/:id', asyncHandler(async (req, res, next) => {
    // find book by id
    const book = await Book.findByPk(req.params.id);
    if(book) { 
        res.render("books/update-book", { book }); 
    } else { 
        const err = new Error();
        err.status = 400;
        next(err);
    }
}));


/* POST /books/:id/ - Update a book.  */
router.post('/:id', asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id); //find book by id
      if(book) {
        await book.update(req.body); // if book id exists, update the Book properties
        res.redirect("/books/" + book.id); 
    } else { 
        const err = new Error();
        err.status = 400;
        next(err);
    }
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; 
        res.render("books/update-book", { book, errors: error.errors})
      } else {
        throw error;
      }
    }
}));


/* GET  Deletes a book form  */
router.get('/:id/delete', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id); 
    if(book) {
      res.render("books/delete", { book }); 
    } else {
      res.sendStatus(404);
    }

}));

/* POST  Deletes a book.  */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      await book.destroy(); // delete the book
      res.redirect("/books"); // redirect back to the main list
    } else {
      res.sendStatus(404);
    }
}));


module.exports = router;
