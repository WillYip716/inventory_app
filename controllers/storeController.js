var Store = require('../models/store');
var Item = require('../models/item');
var Category = require('../models/category');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        store: function(callback) {
            Store.find({}, 'location').exec(callback);
        },
        category: function(callback) {
            Category.find({}, 'name').exec(callback);
        },
        item: function(callback) {
            Item.find({}, 'quantity').exec(callback);
        },
    }, function(err, results) {
        let totalInventory = 0;
        for(let i in results.item){
            totalInventory+= results.item[i].quantity;
        }
        res.render('index', { title: 'Inventory App Home', error: err, store: results.store, category:results.category,itemtotal:totalInventory });
    });
};

// Display list of all stores.
exports.store_list = function(req, res,next) {
    Store.find({})
      .populate('items')
      .exec(function (err, store_list) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('store_list', { title: 'Store Listings', store_list: store_list });
      });
};

// Display detail page for a specific store.
exports.store_detail = function(req, res,next) {
    async.parallel({
        store: function(callback) {
            Store.findById(req.params.id)
              .populate('items')
              .exec(callback);
        },
        categories: function(callback) {
          Category.find({}).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.store==null) { // No results.
            var err = new Error('store not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        var holder = [];
        var catNames = [];
        var temp;
        for(var i=0; i < results.categories.length;i++){
            temp = results.store.items.filter(a => a.category.equals(results.categories[i]._id));
            if(temp.length>0){
                holder.push(temp);
                catNames.push(results.categories[i].name);
            }  
        }
        res.render('store_detail', { title: results.store.location, store: results.store, categorized_items: holder, categoryNames: catNames } );
    });
};

// Display store create form on GET.
exports.store_create_get = function(req, res,next) {
    res.render('store_form',{title:'Create Store'});
};

// Handle store create on POST.
exports.store_create_post = [

    // Validate fields.
    body('location', 'location must be specified').trim().isLength({ min: 1 }),
    body('days', 'days must be chosen').trim().isLength({ min: 1 }),
    body('hours', 'hours must be chosen').trim().isLength({ min: 1 }),
    
    // Sanitize fields.
    sanitizeBody('*').escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var store = new Store(
          { location: req.body.location,
            days: req.body.days,
            hours: req.body.hours,
           });

        if (!errors.isEmpty()) {
            res.render('store_form', { title: 'Create Store', store:store, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid.
            store.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new store.
                   res.redirect(store.url);
                });
        }
    }
];

// Display store delete form on GET.
exports.store_delete_get = function(req, res, next) {

    Store.findById(req.params.id).populate('items').exec(function(err, results) {
        if (err) { return next(err); }
        if (results==null) { // No results.
            res.redirect('/catalog/stores');
        }
        // Successful, so render.
        res.render('store_delete', { title: 'Delete Store', store: results} );
    });
  
};

// Handle store delete on POST.
exports.store_delete_post = function(req, res,next) {

    Store.findById(req.params.id).populate('items').exec(function(err, results) {
        if (err) { return next(err); }
        if (results.items.length) { // store has items.
            res.render('store_delete', { title: 'Delete Store', store: results} );
            return;
        }
        else{
            Store.findByIdAndRemove(req.body.storeid, function deleteStore(err) {
                if (err) { return next(err); }
                // Success - go to book list
                res.redirect('/catalog/stores')
            })
        }   
    });
};

// Display store update form on GET.
exports.store_update_get = function(req, res,next) {
    Store.findById(req.params.id).populate('items').exec(function(err, results) {
        if (err) { return next(err); }
        if (results==null) { // No results.
            res.redirect('/catalog/stores');
        }
        // Successful, so render.
        res.render('store_form', { title: 'Update Store', store: results} );
    });
};

// Handle store update on POST.
exports.store_update_post = [

    // Validate fields.
    body('location', 'location must be specified').trim().isLength({ min: 1 }),
    body('days', 'days must be chosen').trim().isLength({ min: 1 }),
    body('hours', 'hours must be chosen').trim().isLength({ min: 1 }),
    
    // Sanitize fields.
    sanitizeBody('*').escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var store = new Store(
          { location: req.body.location,
            days: req.body.days,
            hours: req.body.hours,
            _id:req.params.id 
           });

        if (!errors.isEmpty()) {
            res.render('store_form', { title: 'Update Store', store:store, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid.
            Store.findById(req.params.id).populate('items').exec(function(err, results) {
                if (err) { return next(err); }
                if (results==null) { // No results.
                    res.redirect('/catalog/stores');
                }
                // Successful, so render.
                store.items = results.items;
                Store.findByIdAndUpdate(req.params.id,store,{}, function (err, theStore ) {
                    if (err) { return next(err); }
                       // Successful - redirect to new store.
                       res.redirect(theStore.url);
                });
            }); 
        }
    }
];
