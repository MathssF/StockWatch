const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }]
});

module.exports = mongoose.model('Product', productSchema);
