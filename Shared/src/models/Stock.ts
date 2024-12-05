const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  stockDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StockDetail' }]
});

module.exports = mongoose.model('Stock', stockSchema);
