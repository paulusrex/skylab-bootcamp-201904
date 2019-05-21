require('dotenv').config();

const validate = require('../../common/validate');
const { ValueError } = require('../../common/errors');
const { ObjectId } = require('mongodb');

const userData = {
  __col_: null,

  create(user) {
    validate.arguments([{ name: 'user', value: user, type: 'object', optional: false }]);

    return (async () => {
      await this.__col__.insertOne(user);
    })();
  },

  list() {
    return this.__col__.find().toArray();
  },

  retrieve(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return this.__col__.findOne(ObjectId(id));
  },

  update(id, user) {
    validate.arguments([
      { name: 'id', value: id, type: 'string', notEmpty: true },
      { name: 'user', value: user, type: 'object', notEmpty: true },
    ]);

    if (user.id && id !== user.id) new ValueError('data id does not match criteria id');
    return (async () => {
      const result = await this.__col__.updateOne({ _id: ObjectId(id) }, { $set: user })
      return result.modifiedCount;
    })();
  },

  delete(id) {
    validate.arguments([{ name: 'id', value: id, type: 'string', notEmpty: true }]);

    return (async() => {
      const result = await this.__col__.deleteOne({_id : ObjectId(id)})
      return result.deletedCount;
    })();
  },

  find(criteria) {
    validate.arguments([
      { name: 'criteria', value: criteria, type: 'object', notEmpty: true },
    ]);

    return (async() => await this.__col__.find(criteria).toArray());
  },
};

module.exports = userData;
