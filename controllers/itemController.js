var Store = require('../models/store');
var Item = require('../models/item');
var Category = require('../models/category');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Display list of all items.
exports.item_list = function(req, res,next) {
    Store.find({})
      .populate('items')
      .sort([['name', 'ascending']])
      .exec(function (err, result) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_list', { title: 'Items', stores: result });
      });
};

// Display detail page for a specific item.
exports.item_detail = function(req, res,next) {
    async.parallel({
        store: function(callback) {
            Store.find({ 'items': req.params.id }).exec(callback);
        },
        item: function(callback) {
            Item.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('item_detail', { title: 'Item Detail', store: results.store, item: results.item } );
    });
};

// Display item create form on GET.
exports.item_create_get = function(req, res,next) {
    Category.find({})
      .exec(function (err, result) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_form',{title:'Create Item',categories:result});
      });
};

// Handle item create on POST.
exports.item_create_post = [

    // Validate fields.
    body('name', 'name must be specified').trim().isLength({ min: 1 }),
    body('summary', 'summary must be specified').trim().isLength({ min: 1 }),
    body('quantity', 'quantity must be set').trim().isNumeric({ min: 1 }),
    body('price', 'price must be set to a decimal').trim().isCurrency(),
    body('category', 'category must be chosen').trim().isLength({ min: 1 }),
    
    // Sanitize fields.
    sanitizeBody('*').escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var item = new Item(
          { 
            name: req.body.name,
            summary: req.body.summary,
            quantity: req.body.quantity,
            price: req.body.price,
            category: req.body.category,
          });

        if (!errors.isEmpty()) {
            Category.find({})
            .exec(function (err, result) {
                if (err) { return next(err); }
                //Successful, so render
                res.render('item_form', { title: 'Create Item', item:item, categories:result, errors: errors.array()});
                return;
            });
        }
        else {
            // Data from form is valid.
            item.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new item.
                   res.redirect(item.url);
            });
        }
    }
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: item delete GET');
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: item delete POST');
};

// Display item update form on GET.
exports.item_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: item update GET');
};

// Handle item update on POST.
exports.item_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: item update POST');
};