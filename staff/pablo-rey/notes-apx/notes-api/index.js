//@ts-check
require('dotenv').config();
const {
  env: { PORT, MONGO_URL },
  argv: [, , port = PORT || 8080],
} = process;

const express = require('express');

const mongoose = require('mongoose');
mongoose.connect(MONGO_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', err => console.error('MongoDB connection error'));

const { ApolloServer } = require('apollo-server-express');
const rootSchema = require('./graphql/rootSchema');
const apolloContext = require('./graphql/middleware/apolloContext');
const apolloServer = new ApolloServer({
schema: rootSchema,
context: apolloContext,
introspection: true,
playground: true,
});

const cors = require('cors');
const package = require('./package.json');

const app = express();

// Middleware
app.use(cors());
apolloServer.applyMiddleware({ app });

app.use('/api', require('./routes/users'), require('./routes/notes'));

db.once('open', async () => {
  app.listen(port, () => console.log(`${package.name} ${package.version} up on port ${port}`));
});