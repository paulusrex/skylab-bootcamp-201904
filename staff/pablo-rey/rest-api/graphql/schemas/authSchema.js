const { gql } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const logic = require('../../logic');
const parseToken = require('../../common/token');

const typeDefs = gql`
  type AuthToken {
    token: String
    userId: String
  }
  type Query {
    login(email: String, password: String): AuthToken
  }
`;

const resolvers = {
  Query: {
    async login(parent, args, context, info) {
      const token = await logic.authenticateUser(args.email, args.password);
      const id = logic.parseId(token);
      return { userId: id, token };
    },
  },
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
