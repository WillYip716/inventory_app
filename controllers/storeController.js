var Store = require('../models/store');
var Item = require('../models/item');
var Category = require('../models/category');

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
exports.store_list = function(req, res) {
    Store.find({})
      .populate('items')
      .exec(function (err, store_list) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('store_list', { title: 'Store Listings', store_list: store_list });
      });
};

// Display detail page for a specific store.
exports.store_detail = function(req, res) {
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
        var temp;
        for(var i=0; i < results.categories.length;i++){
            console.log("searching results");
            console.log(results.categories[i]==results.store.items[0].category);
            temp = results.store.items.filter(a => a.category == results.categories[i]._id);
            if(temp.length>0){
                holder.push();
                console.log("pushed result");
            }  
        }
        res.render('store_detail', { title: results.store.location, store: results.store, categorized_items: holder } );
    });
};

// Display store create form on GET.
exports.store_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: store create GET');
};

// Handle store create on POST.
exports.store_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: store create POST');
};

// Display store delete form on GET.
exports.store_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: store delete GET');
};

// Handle store delete on POST.
exports.store_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: store delete POST');
};

// Display store update form on GET.
exports.store_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: store update GET');
};

// Handle store update on POST.
exports.store_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: store update POST');
};


