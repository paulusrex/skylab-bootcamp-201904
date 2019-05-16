require('dotenv').config()

const express = require('express')
const { ApolloServer } = require("apollo-server-express");
const cors= require('cors');
const package = require('./package.json')
const apolloContext = require("./graphql/middleware/apolloContext");

const { env: { PORT }, argv: [, , port = PORT || 8080], } = process

const app = express()

const rootSchema = require("./graphql/rootSchema");

const apolloServer = new ApolloServer({
  schema: rootSchema,
  context: apolloContext,
  introspection: true,
  playground: true,
});

// Middleware
app.use(cors());
apolloServer.applyMiddleware({ app });

app.use('/api', [require('./routes/users'), require('./routes/ducks')])

// app.use(function (req, res, next) {
//     res.redirect('/')
// })

app.listen(port, () => console.log(`${package.name} ${package.version} up on port ${port}
graphql server ready at http://localhost:${port}${apolloServer.graphqlPath}`))