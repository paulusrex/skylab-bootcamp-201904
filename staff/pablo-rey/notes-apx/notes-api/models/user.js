const mongoose = require('mongoose');

const User = mongoose.model('User', require('./schemas/user'))

module.exports = User;