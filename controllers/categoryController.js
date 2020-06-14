var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const validator = require('express-validator');

// Display list of all categorys.
exports.category_list = function(req, res,next) {
    Category.find({})
      .sort([['name', 'ascending']])
      .exec(function (err, result) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('category_list', { title: 'Categories', categories: result });
      });
};

// Display detail page for a specific category.
exports.category_detail = function(req, res,next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_items: function(callback) {
            Item.find({ 'category': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });
};

// Display category create form on GET.
exports.category_create_get = function(req, res,next) {
    res.render('category_form', { title: 'Create Category' });
};

// Handle category create on POST.
exports.category_create_post = [
   
    // Validate that the name field is not empty.
    validator.body('name', 'Category name').trim().isLength({ min: 1 }),
    
    // Sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validator.validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if category with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // category exists, redirect to its detail page.
               res.redirect(found_category.url);
             }
             else {
  
               category.save(function (err) {
                 if (err) { return next(err); }
                 // category saved. Redirect to category detail page.
                 res.redirect(category.url);
               });
  
             }
  
           });
      }
    }
  ];

// Display category delete form on GET.
exports.category_delete_get = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        item: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/catalog/category');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.item } );
    });
};

// Handle category delete on POST.
exports.category_delete_post = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        item: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item.length>0) { // No results.
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.item } );
            return;
        }
        else{
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to genres list
                res.redirect('/catalog/categories')
            })
        }
    });
  };

// Display category update form on GET.
exports.category_update_get = function(req, res,next) {
    Category.findById(req.params.id)
        .exec(function(err,result){
            if(err){return next(err);}
            res.render('category_form',{title:'Category Update', category: result});
        });
};

// Handle category update on POST.
exports.category_update_post = [
   
    // Validate that the name field is not empty.
    validator.body('name', 'Category name').trim().isLength({ min: 1 }),
    
    // Sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validator.validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name,
            _id: req.params.id }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if category with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // category exists, redirect to its detail page.
               res.redirect(found_category.url);
             }
             else {
                
                Category.findByIdAndUpdate(req.params.id,category,{}, function(err,result) {
                    if (err) { return next(err); }
                    // Success - go to genres list
                    res.redirect(result.url);
                })
  
             }
  
           });
      }
    }
  ];