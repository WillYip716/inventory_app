var Store = require('../models/store');
var Item = require('../models/item');
var Category = require('../models/category');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');


const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'public/images',});

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
            Item.findById(req.params.id).populate('category')
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
    async.parallel({
        store: function(callback) {
            Store.find({}).exec(callback);
        },
        category: function(callback) {
            Category.find({}).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_form',{title:'Create Item',categories:results.category,stores:results.store});
    });
};

// Handle item create on POST.
exports.item_create_post = [

    upload.single('picture'),

    // Validate fields.
    body('store', 'store must be chose').trim().isLength({ min: 1 }),
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

          if (req.file) {
			item.picture = req.file.path.slice(6);
		  }

        if (!errors.isEmpty()) {
            async.parallel({
                store: function(callback) {
                    Store.find({}).exec(callback);
                },
                category: function(callback) {
                    Category.find({}).exec(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }
                //Successful, so render
                res.render('item_form',{title:'Create Item',categories:results.category,stores:results.store,errors: errors.array(),item:item});
            });
        }
        else {
            // Data from form is valid.
            item.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new item.
                   Store.findById(req.body.store).exec(function (err, result) {
                    if (err) { return next(err); }
                    if (result==null) { // No results.
                        res.redirect('/catalog/stores');
                    }
                    //Successful, so render
                    result.items.push(item);
                    result.save(function(err1){
                        if (err1) { return next(err); }
                        res.redirect(item.url);
                    });
                  });
            });
        }
    }
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {

    async.parallel({
        store: function(callback) {
            Store.find({ 'items': req.params.id }).exec(callback);
        },
        item: function(callback) {
            Item.findById(req.params.id).populate('category')
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
        res.render('item_delete', { title: 'Item Delete', store: results.store, item: results.item } );
    });
  
};
// Handle item delete on POST.
exports.item_delete_post = function(req, res,next) {

    async.parallel({
        store: function(callback) {
            Store.find({ 'items': req.params.id }).exec(callback);
        },
        item: function(callback) {
            Item.findById(req.params.id).populate('category')
              .exec(callback);
        },
    },function(err, results) {
        if (err) { return next(err); }
        Store.updateOne( {_id:req.body.storeid}, { $pullAll: {items: [req.body.itemid] } } ).exec(function(err){
            if (err) { return next(err); }

            Item.findByIdAndRemove(req.body.itemid,function(err2, itemfound){
                if (err2) { return next(err2); }
                if(itemfound.picture!="holder"){
                    fs.unlink('public' + itemfound.picture, function (err) {
                        if (err) throw err;
                    });
                }
                res.redirect('/catalog/items');
            })
        })
    });
};

// Display item update form on GET.
exports.item_update_get = function(req, res,next) {
    async.parallel({
        store: function(callback) {
            Store.find({}).exec(callback);
        },
        category: function(callback) {
            Category.find({}).exec(callback);
        },
        item: function(callback) {
            Item.findById(req.params.id).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        //Successful, so render
        if (results.item==null) { // No results.
            res.redirect('/catalog/items');
        }
        res.render('item_form',{title:'Update Item',categories:results.category,stores:results.store,item:results.item});
    });
};

// Handle item update on POST.
exports.item_update_post = [
    upload.single('picture'),
    // Validate fields.
    body('store', 'store must be chose').trim().isLength({ min: 1 }),
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
            _id:req.params.id 
          });
        
          if (req.file) {
			item.picture = req.file.path.slice(6);
		  }

        if (!errors.isEmpty()) {
            async.parallel({
                store: function(callback) {
                    Store.find({}).exec(callback);
                },
                category: function(callback) {
                    Category.find({}).exec(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }
                //Successful, so render
                res.render('item_form',{title:'Create Item',categories:results.category,stores:results.store,errors: errors.array(),item:item});
            });
        }
        else {
            // Data from form is valid.
            Item.findByIdAndUpdate(req.params.id,item,{},function (err,theItem) {
                if (err) { return next(err); }
                

                Store.find({ 'items': req.params.id }).exec(function(err1,livestore){
                    if (err1) { return next(err1); }
                    if (livestore==null) { // No results.
                        res.redirect('/catalog/items');
                    }
                    if(livestore[0].equals(req.body.store)){
                        res.redirect(theItem.url);
                    }
                    else{
                        Store.updateOne( {_id:livestore[0]._id}, { $pullAll: {items: [req.params.id] } } ).exec(function(err){
                            if (err) { return next(err); }
                            Store.findById(req.body.store).exec(function (err3, result) {
                                if (err3) { return next(err3); }
                                if (result==null) { // No results.
                                    res.redirect('/catalog/stores');
                                }
                                //Successful, so render
                                result.items.push(theItem);
                                
                                result.save(function(err4){
                                    if (err4) { return next(err4); }
                                    res.redirect(theItem.url);
                                });
                            });
                        })
                    }
                    
                });                
            });
        }
    }
];