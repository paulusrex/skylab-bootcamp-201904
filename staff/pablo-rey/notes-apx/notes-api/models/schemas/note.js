const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

module.exports = new Schema({
  text: {
    type: String,
    required: true,
  },
  author: { type: ObjectId, ref: 'User', required: true },
  parent: { type: ObjectId, ref: 'Note' },
  date: { type: Date, default: Date.now, required: true },
});
