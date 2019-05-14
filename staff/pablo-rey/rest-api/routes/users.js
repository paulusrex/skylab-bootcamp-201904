const express = require('express');
const bodyParser = require('body-parser');
const logic = require('../logic');
const handleErrors = require('./handle-errors');
const { UnauthorizedError } = require('../common/errors');

const jsonParser = bodyParser.json();

const router = express.Router();

router.post('/users', jsonParser, (req, res) => {
  const {
    body: { name, surname, email, password },
  } = req;

  handleErrors(
    () =>
      logic
        .registerUser(name, surname, email, password)
        .then(() => res.status(201).json({ message: 'Ok, user registered. ' })),
    res
  );
});

router.post('/users/auth', jsonParser, (req, res) => {
  const {
    body: { email, password },
  } = req;

  handleErrors(
    () => logic.authenticateUser(email, password).then(token => res.json({ token })),
    res
  );
});

router.get('/users', (req, res) => {
  handleErrors(() => {
    const {
      headers: { authorization },
    } = req;

    if (!authorization) throw new UnauthorizedError();

    const token = authorization.slice(7);

    if (!token) throw new UnauthorizedError();

    return logic.retrieveUser(token).then(user => res.json(user));
  }, res);
});

module.exports = router;
