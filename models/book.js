'use strict';
const Sequelize = require('sequelize');

//define a book model
module.exports = (sequelize) => {
  class Book extends Sequelize.Model {}
  Book.init({  // initialize dataTypes

    title: {
        type: Sequelize.STRING,
        allowNull: false, 
        //set validators to disallow empty field
        validate: {
            notNull: {
                msg: 'Please provide a value for "Title"',
            },
            notEmpty: { // To prevent the title value from being empty
                msg: 'Title is required'         
            }      
        },
    },

    author: {  
        type: Sequelize.STRING,
        allowNull: false, 
        //set validators to disallow empty field
        validate: {
          notNull: {
              msg: 'Please provide a value for "Author"',
          },
          notEmpty: { // prevent the author value from being empty
              msg: 'Author is required'
          }      
        },
    },
    genre: Sequelize.STRING,
    year: Sequelize.INTEGER
    
    }, { sequelize });

  return Book;
};