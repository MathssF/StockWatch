const mongoose = require('mongoose');

const detailTypeSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('DetailType', detailTypeSchema);
