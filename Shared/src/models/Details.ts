const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DetailType' },
  value: String
});

module.exports = mongoose.model('Detail', detailSchema);
