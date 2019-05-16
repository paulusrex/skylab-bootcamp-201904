const fs = require('fs').promises;
const path = require('path');
const uuid = require('uuid/v4');
const validate = require('../../common/validate');
const { ValueError } = require('../../common/errors');

const userData = {
  __file__: path.join(__dirname, 'users.json'),

  __load__() {
    return fs.readFile(this.__file__, 'utf8').then(JSON.parse);
  },

  __save__(data) {
    return fs.writeFile(this.__file__, JSON.stringify(data))
  }

  create(user) {
    validate.arguments([{ name: 'user', value: user, type: 'object', optional: false }]);

    user.id = uuid();
    return this.__load__()
      .then(users => {
        users.push(user);
        return this.__save__(users);
      })
      .then(() => user);
  },

  list() {
    return this.__load__();
  },

  retrieve(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return this.__load__().then(users => {
      const user = users.find(user => user.id === id);
      return user;
    });
  },

  update(id, user, replace) {
    validate.arguments([
      { name: 'id', value: id, type: 'string', notEmpty: true },
      { name: 'user', value: user, type: 'object', notEmpty: true },
      { name: 'replace', value: replace, type: 'boolean', optional: true },
    ]);

    if (user.id && id !== user.id) new ValueError('data id does not match criteria id')

    return this.__load__().then(users => {
      const index = users.findIndex(user => user.id === id);
      if (index !== -1) {
        const updatedUser = (replace) ?  ({ ...user, id }) : ({ ...users[index], ...user, id });
        users[index] = updatedUser;
        return this.__save__(users)
          .then(() => users[index]);
      } 
    });
  },

  delete(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return this.__load__().then(users => {
      const index = users.findIndex(user => user.id === id);
      if (index === -1) return false;
      const userRemoved = users.splice(index, 1);
      return this.__save__(users).then(() => userRemoved[0]);
    });
  },

  find(criteria) {
    if (!criteria instanceof Object) {
      throw new Error('criteria must be a function or an object');
    }

    const criteriafn =
      criteria instanceof Function
        ? criteria
        : user => Object.keys(criteria).every(key => user[key] === criteria[key]);

    return this.__load__().then(users => {
      const result = users.filter(criteriafn);
      return result;
    });
  },
};

module.exports = userData;
