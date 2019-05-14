//@ts-check
const validate = require('../common/validate');
const userApi = require('../data/user-api');
const duckApi = require('../data/duck-api');
const { LogicError } = require('../common/errors');
const parseToken = require('../common/token');

const logic = {
  registerUser(name, surname, email, password) {
    validate.arguments([
      { name: 'name', value: name, type: 'string', notEmpty: true },
      { name: 'surname', value: surname, type: 'string', notEmpty: true },
      { name: 'email', value: email, type: 'string', notEmpty: true },
      { name: 'password', value: password, type: 'string', notEmpty: true },
    ]);

    validate.email(email);

    return userApi.create(email, password, { name, surname }).then(response => {
      if (response.status === 'OK') return;

      throw new LogicError(response.error);
    });
  },

  authenticateUser(email, password) {
    validate.arguments([
      { name: 'email', value: email, type: 'string', notEmpty: true },
      { name: 'password', value: password, type: 'string', notEmpty: true },
    ]);

    validate.email(email);

    return userApi.authenticate(email, password).then(response => {
      if (response.status === 'OK') return response.data.token;
      else throw new LogicError(response.error);
    });
  },

  retrieveUser(token) {
    validate.arguments([
      { name: 'token', value: token, type: 'string', notEmpty: true, optional: false },
    ]);
    const { id } = parseToken.payload(token);
    return userApi.retrieve(id, token).then(response => {
      if (response.status === 'OK') {
        const {
          data: { name, surname, username: email },
        } = response;

        return { name, surname, email };
      } else throw new LogicError(response.error);
    });
  },

  searchDucks(token, query) {
    validate.arguments([
      { name: 'token', value: token, type: 'string', notEmpty: true, optional: false },
      { name: 'query', value: query, type: 'string' },
    ]);

    const { id } = parseToken.payload(token);
    return userApi
      .retrieve(id, token)
      .then(res => {
        if (res.status !== 'OK') throw new LogicError(res.error);
      })
      .then(() => duckApi.searchDucks(query))
      .then(ducks => (ducks instanceof Array ? ducks : []));
  },

  retrieveDuck(token, duckId) {
    validate.arguments([
      { name: 'token', value: token, type: 'string', notEmpty: true, optional: false },
      { name: 'id', value: duckId, type: 'string' },
    ]);

    const { id: userId } = parseToken.payload(token);
    return userApi
      .retrieve(userId, token)
      .then(res => {
        if (res.status !== 'OK') throw new LogicError(res.error);
      })
      .then(() => duckApi.retrieveDuck(duckId));
  },

  toggleFavDuck(token, duckId) {
    validate.arguments([
      { name: 'token', value: token, type: 'string', notEmpty: true, optional: false },
      { name: 'id', value: duckId, type: 'string' },
    ]);

    const { id: userId } = parseToken.payload(token);
    return userApi.retrieve(userId, token).then(response => {
      const { status, data } = response;

      if (status === 'OK') {
        const { favs = [] } = data; // NOTE if data.favs === undefined then favs = []

        const index = favs.indexOf(duckId);

        if (index < 0) favs.push(duckId);
        else favs.splice(index, 1);

        return userApi.update(userId, token, { favs }).then(() => {});
      }

      throw new LogicError(response.error);
    });
  },

  retrieveFavDucks(token) {
    const { id: userId } = parseToken.payload(token);
    return userApi.retrieve(userId, token).then(response => {
      const { status, data } = response;

      if (status === 'OK') {
        const { favs = [] } = data;

        if (favs.length) {
          const calls = favs.map(fav => duckApi.retrieveDuck(fav));

          return Promise.all(calls);
        } else return favs;
      }

      throw new LogicError(response.error);
    });
  },
};

module.exports = logic;
