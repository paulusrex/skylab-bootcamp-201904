require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const package = require('./package.json');
const apolloContext = require('./graphql/middleware/apolloContext');
const userData = require('./data/user-data');

const {
  env: { PORT },
  argv: [, , port = PORT || 8080],
} = process;

const app = express();

const rootSchema = require('./graphql/rootSchema');

const apolloServer = new ApolloServer({
  schema: rootSchema,
  context: apolloContext,
  introspection: true,
  playground: true,
});

// Middleware
app.use(cors());
apolloServer.applyMiddleware({ app });

app.use('/api', [require('./routes/users'), require('./routes/ducks')]);

MongoClient.connect(userData.__url__, { useNewUrlParser: true }).then(client => {
  db = client.db();
  userData.__col__ = db.collection('users');
  app.listen(port, () => console.log(`${package.name} ${package.version} up on port ${port}`));
});
