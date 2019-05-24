const { mergeSchemas } = require('graphql-tools');
const authSchema = require('./schemas/authSchema');
const userSchema = require('./schemas/userSchema');

module.exports = mergeSchemas({
  schemas: [authSchema, userSchema],
});
