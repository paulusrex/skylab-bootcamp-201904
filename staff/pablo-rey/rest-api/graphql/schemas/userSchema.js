const { makeExecutableSchema } = require('graphql-tools');
const { gql } = require('apollo-server-express');
const logic = require('../../logic');
const { LogicError } = require('../../common/errors');
const { UserInputError, AuthenticationError } = require('apollo-server');
const userData = require('../../data/user-data');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    surname: String!
    favs: [String!]!
  }
  type Query {
    users: [User!]!
    user: User!
  }
  type Mutation {
    createUser(email: String!, name: String!, surname: String!, password: String!): Boolean!
    updateUser(email: String, name: String, surname: String, password: String): Boolean!
    deleteUser: Boolean!
  }
`;

const resolvers = {
  Query: {
    async users(parent, args, { token }, info) {
      if (!logic.verifyToken(token)) throw new AuthenticationError('wrong/missing credentials');
      return await userData.list();
    },
    async user(parent, args, { userId }, info) {
      const result = await logic.retrieveCompleteUser(userId);
      return { ...result, id: userId, cart: retrieveCart(userId) };
    },
  },
  Mutation: {
    async createUser(parent, args, context, info) {
      const { email, name, surname, password } = args;
      let result = {};
      try {
        result = await logic.registerUser(name, surname, email, password);
      } catch (error) {
        throw new UserInputError(error.message);
      }
      return result;
    },
    async updateUser(parent, args, { token }, info) {
      const { email, name, surname, password } = args;

      if (logic.verifyToken(token)) throw new AuthenticationError('wrong/missing credentials');

      const result = await logic.updateUser(token, name, surname, email, password);
      return !result;
    },
    async deleteUser(parent, args, { token }, info) {
      const result = await logic.deleteUser(token);
      return !result;
    },
  },
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
