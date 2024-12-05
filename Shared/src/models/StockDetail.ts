const mongoose = require('mongoose');

const stockDetailSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
  detailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Detail' }
});

module.exports = mongoose.model('StockDetail', stockDetailSchema);
