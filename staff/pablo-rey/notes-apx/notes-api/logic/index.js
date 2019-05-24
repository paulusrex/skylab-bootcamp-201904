//@ts-check
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const validate = require('../common/validate');
const User = require('../models/user');
const Note = require('../models/note');
const { LogicError, UnauthorizedError, ValueError } = require('../common/errors');
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

    return (async () => {
      const _user = await User.findOne({ email });
      if (_user) throw new LogicError(`user with email "${email}" already registered`);
      const hash = await bcryptjs.hash(password, 8);
      const user = {
        name,
        surname,
        email,
        password: hash,
      };
      await User.create(user);
    })();
  },

  authenticateUser(email, password) {
    validate.arguments([
      { name: 'email', value: email, type: 'string', notEmpty: true },
      { name: 'password', value: password, type: 'string', notEmpty: true },
    ]);

    return (async () => {
      const users = await User.find({ email });
      if (!users.length) throw new LogicError(`user with email "${email}" does not exist`);
      const user = users[0];
      const check = await bcryptjs.compare(password, user.password);
      if (!check) throw new LogicError(`wrong credentials`);
      return this.__signToken__(user);
    })();
  },

  retrieveUser(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);
    return User.findById(id).then(user => {
      if (!user) throw new LogicError(`user with id "${id}" does not exists`);
      return user;
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
    const note = new Note({ author, text, date });
    return note.save();
  },

  retrieveNote(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);
    return Note.findById(id);
  },

  async allNotes() {
    return await Note.find();
  },

  updateNote(id, data) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);
    return Note.findByIdAndUpdate(id, data);
  },

  async deleteNote(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);
    const noteDeleted = await Note.findByIdAndDelete(id);
    if (!noteDeleted) throw new ValueError('id not found');
    return noteDeleted;
  },

  addPrivateNote(id, noteData) {
    return (async () => {
      const user = await logic.retrieveUser(id);
      const note = new Note({ ...noteData, author: user });

      user.privateNotes.push(note);
      await user.save();
      return true;
    })();
  },
};

module.exports = logic;
