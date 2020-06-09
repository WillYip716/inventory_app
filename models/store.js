var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StoreSchema = new Schema(
  {
    location: {type: String, required: true},
    days: {type: String, required: true, enum: ['Mon-Sun', 'Mon-Sat', 'Mon-Fri'], default: 'Mon-Sun'},
    hours: {type: String, required: true, enum: ['8:00am-8:00pm', '8:00am-9:00pm', '7:00am-8:00pm', '7:00am-9:00pm' ], default: '8:00am-8:00pm'},
    items: [{type: Schema.Types.ObjectId, ref: 'Item'}],
  }
);

// Virtual for stores
StoreSchema
.virtual('url')
.get(function () {
  return '/catalog/store/' + this._id;
});

//Export model
module.exports = mongoose.model('Store', StoreSchema);