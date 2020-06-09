var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true},
    summary: {type: String, required: true},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    picture: {type: String, required: true, default:'holder'}
  }
);

// Virtual for items
ItemSchema
.virtual('url')
.get(function () {
  return '/catalog/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);