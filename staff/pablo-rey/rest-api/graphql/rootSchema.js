const { mergeSchemas } = require('graphql-tools');
const authSchema = require('./schemas/authSchema');
const userSchema = require('./schemas/userSchema');
const duckSchema = require('./schemas/duckSchema');

module.exports = mergeSchemas({
  schemas: [authSchema, userSchema, duckSchema],
});
