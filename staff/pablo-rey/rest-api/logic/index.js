//@ts-check
const jwt = require('jsonwebtoken');
const validate = require('../common/validate');
const userData = require('../data/user-data');
const duckApi = require('../data/duck-api');
const { LogicError, UnknownError, UnauthorizedError } = require('../common/errors');
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
    return userData.find({ email }).then(users => {
      if (users.length) throw new LogicError(`user with email "${email}" already registered`);
      return userData.create(user).then(user => {
        const _user = { ...user };
        delete _user.password;
        return _user;
      });
    });
  },

  authenticateUser(email, password) {
    validate.arguments([
      { name: 'email', value: email, type: 'string', notEmpty: true },
      { name: 'password', value: password, type: 'string', notEmpty: true },
    ]);

    return userData.find({ email }).then(users => {
      if (!users.length) throw new LogicError(`user with email "${email}" does not exist`);
      const user = users[0];
      if (user.password !== password) throw new LogicError(`wrong credentials`);
      return this.__signToken__(user);
    });
  },

  retrieveUser(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return userData.retrieve(id).then(user => {
      if (!user) throw new LogicError(`user with id "${id}" does not exists`);
      const _user = { ...user };
      delete _user.password;
      return _user;
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

    // const { id } = _token.payload(token);

    let data = {};
    if (name) data = { name };
    if (surname) data = { ...data, surname };
    if (email) data = { ...data, email };
    if (password) data = { ...data, password };

    return userData.update(id, data).then(user => {
      const _user = { ...user };
      delete _user.password;
      return _user;
    });
  },

  deleteUser(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return userData.delete(id);
  },

  searchDucks(query) {
    validate.arguments([{ name: 'query', value: query, type: 'string' }]);

    return duckApi.searchDucks(query).then(ducks => (ducks instanceof Array ? ducks : []));

  },

  retrieveDuck(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return duckApi.retrieveDuck(id);

  },

  toggleFavDuck(userId, duck) {
    validate.arguments([{ name: 'userId', value: userId, type: 'string' }]);

    let duckId;
    if (typeof duck === 'string') duckId = duck;
    else if (duck.id) duckId = duck.id;
    else throw TypeError(`duck is not a string or valid duck`);

    return userData.retrieve(userId).then(user => {
      const { favs = [] } = user;
      const index = favs.indexOf(duckId);
      if (index === -1) favs.push(duckId);
      else favs.splice(index, 1);
      return userData.update(user.id, {...user, favs}).then(user => undefined)
    });

  },

  retrieveFavDucks(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return userData.retrieve(id)
    .then(user => {
      const { favs = [] } = user;
      if (favs.length) {
        const calls = favs.map(fav => duckApi.retrieveDuck(fav));

        return Promise.all(calls);
      } else return [];
    });
  },
};

module.exports = logic;
