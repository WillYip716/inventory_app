var Store = require('../models/store');
var Item = require('../models/item');
var Category = require('../models/category');

exports.index = function(req, res) {
    res.render('index', { title: 'Inventory App Home'});
};

// Display list of all stores.
exports.store_list = function(req, res) {
    res.send('NOT IMPLEMENTED: store list');
};

// Display detail page for a specific store.
exports.store_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: store detail: ' + req.params.id);
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


