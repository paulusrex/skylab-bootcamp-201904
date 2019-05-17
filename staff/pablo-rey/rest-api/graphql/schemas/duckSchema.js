const { makeExecutableSchema } = require('graphql-tools');
const { gql } = require('apollo-server-express');
const logic = require('../../logic');
const { UserInputError } = require( 'apollo-server')

const typeDefs = gql`
  type Duck {
    id: ID!
    title: String!
    price: String!
    imageUrl: String!
  }
  type DuckDetail {
    id: ID!
    title: String!
    price: String!
    imageUrl: String!
    link: String!
    description: String!
  }
  type Query {
    ducks(query: String!): [Duck!]!
    duck(id: String!): DuckDetail!
  }
  type Mutation {
    toggleDuck(userId: String!, duckId: String!): Boolean!
  }
`;

const resolvers = {
  Query: {
    async ducks(parent, args, context, info) {
      return await logic.searchDucks(args.query);
    },
    async duck(parent, args, context, info) {
      return await logic.retrieveDuck(args.id);
    },
  },
  Mutation: {
    async toggleDuck(parent, args, context, info) {
      
    }
  }
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
