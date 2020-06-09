#! /usr/bin/env node

console.log('This script will populate the mongodb');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')
var Store = require('./models/store')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categorys = []
var stores = []

function itemCreate(name,summary, quantity, price, category,picture,cb) {
    itemDetails = {name:name, summary:summary, quantity:quantity, price:price, category:category}
    if (picture != false) {itemDetails.picture = picture;}
    else{itemDetails.picture="holder";}


    var item = new Item(itemDetails);

    item.save(function(err){
        if (err) {
            console.log('error in creating item: ' + name);
            cb(err, null)
            return
          }
          console.log('New item: ' + item);
          items.push(item)
          cb(null, item)
    });
}

function categoryCreate(name,cb){
    var category = new Category({name:name});

    category.save(function(err){
        if(err){
            console.log('err in creating category: ' + name);
            cb(err, null)
            return
        }
        console.log('new category: ' + category);
        categorys.push(category);
        cb(null,category)
    })
}

function storeCreate(location,days,hours,items,cb){
    storeDetails = {location:location , days:days, hours:hours, items:items}
    var store = new Store(storeDetails);

    store.save(function(err){
        if(err){
            console.log('err in creating store: ' + location);
            cb(err, null)
            return
        }
        console.log('new store: ' + store);
        stores.push(store);
        cb(null,store)
    })
}

function createC(cb){
    async.series([
        function(callback) {
            categoryCreate('Electronics',callback);
        },
        function(callback) {
            categoryCreate('Furniture',callback);
        },
        function(callback) {
            categoryCreate('Food',callback);
        },
    ],cb);
}

function createI(cb){
    async.series([
        function(callback) {
            itemCreate('Apple', 'a nice and delicious apple', '200', '.25', categorys[2],false,callback);
        },
        function(callback) {
            itemCreate('Apple', 'a nice and delicious apple', '150', '.25', categorys[2],false,callback);
        },
        function(callback) {
            itemCreate('Banana', 'a nice and delicious banana', '200', '.19',categorys[2],false,callback);
        },
        function(callback) {
            itemCreate('Banana', 'a nice and delicious banana', '100', '.19',categorys[2],false,callback);
        },
        function(callback) {
            itemCreate('Orange', 'a nice and delicious orange', '200', '.25', categorys[2],false,callback);
        },
        function(callback) {
            itemCreate('Chair', 'something to sit on', '20', '40.00', categorys[1],false,callback);
        },
        function(callback) {
            itemCreate('Table', 'something to eat on', '10', '100.00', categorys[1],false,callback);
        },
        function(callback) {
            itemCreate('Table', 'something to eat on', '20', '100.00', categorys[1],false,callback);
        },
        function(callback) {
            itemCreate('Laptop', 'something to work on', '4', '500.00', categorys[0],false,callback);
        },
        function(callback) {
            itemCreate('Television', 'something to watch', '10', '1000.00', categorys[0],false,callback);
        },
        function(callback) {
            itemCreate('PS4', 'something to play', '100', '399.99', categorys[0],false,callback);
        },
    ],cb);
}


function createS(cb) {
    async.series([
        function(callback) {
            storeCreate('Boston','Mon-Sun','7:00am-8:00pm',[items[0],items[2],items[4]],callback);
        },
        function(callback) {
            storeCreate('Dallas','Mon-Sat','7:00am-9:00pm',[items[1],items[3]],callback);
        },
        function(callback) {
            storeCreate('Los Angeles','Mon-Fri','8:00am-9:00pm',[items[5],items[6],items[8]],callback);
        },
        function(callback) {
            storeCreate('San Francisco','Mon-Fri','8:00am-8:00pm',[items[7],items[9],items[10]],callback);
        },
        
    ],
        // optional callback
        cb);
}



async.series([
    createC,
    createI,
    createS
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('done');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
