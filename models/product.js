const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  repeat: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);

