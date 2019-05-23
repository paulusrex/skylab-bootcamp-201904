const mongoose = require('mongoose');

const Note = mongoose.model('Note', require('./schemas/note'))

module.exports = Note;