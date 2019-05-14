//@ts-check
const express = require('express');
const package = require('./package.json');
const jsonParser = require('body-parser').json();
const logic = require('./logic');

const {
  argv: [, , port = 8080],
} = process;

const app = express();

app.post('/user', jsonParser, (req, res) => {
  const {
    body: { name, surname, email, password },
  } = req;

  try {
    logic
      .registerUser(name, surname, email, password)
      .then(() => res.json({ status: 'OK' }))
      .catch(({ message }) => res.status(400).json({ error: message }));
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

app.get('/user/', (req, res) => {
  if (!req.get('Authorization')) res.status(400).json({ error: 'no auth provided' }); 
  const token = req.get('Authorization').split(' ')[1];
  
  try {
    logic
      .retrieveUser(token)
      .then((userData) => res.json(userData))
      .catch(({ message }) => res.status(400).json({ error: message }));
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

app.post('/auth', jsonParser, (req, res) => {
  const {
    body: { email, password },
  } = req;

  try {
    logic
      .authenticateUser(email, password)
      .then(token => res.json({ token }))
      .catch(({ message }) => res.status(401).json({ message }));
  } catch ({ message }) {
    res.status(400).json({ message });
  }
});

app.get('/duck/:id', (req, res) => {
  const {
    params: { id },
  } = req;

  if (!req.get('Authorization')) res.status(400).json({ error: 'no auth provided' }); 
  const token = req.get('Authorization').split(' ')[1];

  try {
    logic
      .retrieveDuck(token, id)
      .then((duckData) => res.json(duckData))
      .catch(({ message }) => res.status(400).json({ error: message }));
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

app.get('/ducks', (req, res) => {
  const {
    query: { query }
  } = req;

  if (!req.get('Authorization')) res.status(400).json({ error: 'no auth provided' }); 
  const token = req.get('Authorization').split(' ')[1];

  try {
    logic
      .searchDucks(token, query)
      .then((duckList) => res.json(duckList))
      .catch(({ message }) => res.status(400).json({ error: message }));
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

app.get('/ducks/favs', (req, res) => {
  if (!req.get('Authorization')) res.status(400).json({ error: 'no auth provided' }); 
  const token = req.get('Authorization').split(' ')[1];

  try {
    logic
      .retrieveFavDucks(token)
      .then((duckList) => res.json(duckList))
      .catch(({ message }) => res.status(400).json({ error: message }));
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

app.put('/ducks/favs/toggle/:id', (req, res) => {
  const {
    params: { id },
  } = req;
  if (!req.get('Authorization')) res.status(400).json({ error: 'no auth provided' }); 
  const token = req.get('Authorization').split(' ')[1];

  try {
    logic
      .toggleFavDuck(token, id)
      .then(() => res.json({status: 'OK'}))
      .catch(({ message }) => res.status(400).json({ error: message }));
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

app.use(function(req, res, next) {
  debugger;
  res.redirect('/');
});

app.listen(port, () => console.log(`${package.name} ${package.version} up on port ${port}`));
