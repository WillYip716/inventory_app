var express = require('express');
var router = express.Router();

// Require controller modules.
var store_controller = require('../controllers/storeController');
var item_controller = require('../controllers/itemController');
var category_controller = require('../controllers/categoryController');

/// store ROUTES ///

// GET catalog home page.
router.get('/', store_controller.index);

// GET request for creating a store. NOTE This must come before routes that display store (uses id).
router.get('/store/create', store_controller.store_create_get);

// POST request for creating store.
router.post('/store/create', store_controller.store_create_post);

// GET request to delete store.
router.get('/store/:id/delete', store_controller.store_delete_get);

// POST request to delete store.
router.post('/store/:id/delete', store_controller.store_delete_post);

// GET request to update store.
router.get('/store/:id/update', store_controller.store_update_get);

// POST request to update store.
router.post('/store/:id/update', store_controller.store_update_post);

// GET request for one store.
router.get('/store/:id', store_controller.store_detail);

// GET request for list of all store items.
router.get('/stores', store_controller.store_list);

/// item ROUTES ///

// GET request for creating item. NOTE This must come before route for id (i.e. display item).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating item.
router.post('/item/create', item_controller.item_create_post);

// GET request to delete item.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete item.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update item.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update item.
router.post('/item/:id/update', item_controller.item_update_post);

// GET request for one item.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all items.
router.get('/items', item_controller.item_list);

/// category ROUTES ///

// GET request for creating a category. NOTE This must come before route that displays category (uses id).
router.get('/category/create', category_controller.category_create_get);

//POST request for creating category.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update category.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all category.
router.get('/categories', category_controller.category_list);



module.exports = router;