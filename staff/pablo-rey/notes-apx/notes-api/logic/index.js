//@ts-check
const jwt = require('jsonwebtoken');
const validate = require('../common/validate');
const User = require('../models/user');
const Note = require('../models/note');
const { LogicError, UnauthorizedError } = require('../common/errors');
const _token = require('../common/token');

const logic = {
  __signToken__(user) {
    if (!user) throw new UnauthorizedError('invalid credentials');
    return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  },
  verifyToken(token) {
    if (!token) return false;
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  parseId(token) {
    return _token.payload(token).sub;
  },

  registerUser(name, surname, email, password) {
    validate.arguments([
      { name: 'name', value: name, type: 'string', notEmpty: true },
      { name: 'surname', value: surname, type: 'string', notEmpty: true },
      { name: 'email', value: email, type: 'string', notEmpty: true },
      { name: 'password', value: password, type: 'string', notEmpty: true },
    ]);

    validate.email(email);

    const user = {
      name,
      surname,
      email,
      password,
    };
    return User.find({ email }).then(users => {
      if (users.length) throw new LogicError(`user with email "${email}" already registered`);
      return User.create(user);
    });
  },

  authenticateUser(email, password) {
    validate.arguments([
      { name: 'email', value: email, type: 'string', notEmpty: true },
      { name: 'password', value: password, type: 'string', notEmpty: true },
    ]);

    return User.find({ email }).then(users => {
      if (!users.length) throw new LogicError(`user with email "${email}" does not exist`);
      const user = users[0];
      if (user.password !== password) throw new LogicError(`wrong credentials`);
      return this.__signToken__(user);
    });
  },

  retrieveUser(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);
    return User.findById(id).then(user => {
      if (!user) throw new LogicError(`user with id "${id}" does not exists`);
      const { _id, name, surname, email } = user;
      return { id: _id.toString(), name, surname, email };
    });
  },

  updateUser(id, name, surname, email, password) {
    validate.arguments([
      { name: 'id', value: id, type: 'string', notEmpty: true },
      { name: 'name', value: name, type: 'string', optional: true },
      { name: 'surname', value: surname, type: 'string', optional: true },
      { name: 'email', value: email, type: 'string', optional: true },
      { name: 'password', value: password, type: 'string', optional: true },
    ]);

    let data = {};
    if (name) data = { name };
    if (surname) data = { ...data, surname };
    if (email) data = { ...data, email };
    if (password) data = { ...data, password };

    return User.findOneAndUpdate(id, data).then(() => {});
  },

  deleteUser(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return User.findByIdAndDelete(id);
  },

  createNewNote(author, text, date) {
    return Note.create({ author, text, date });
  },
};

module.exports = logic;
