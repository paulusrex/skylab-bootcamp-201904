//@ts-check
const express = require('express');
const bodyParser = require('body-parser');
const logic = require('../logic');
const handleErrors = require('./handle-errors');
const auth = require('./auth');

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

router.put('/users', auth, jsonParser, (req, res) => {
  const {
    body: { name, surname, email, password },
    userId,
  } = req;

  handleErrors(
    () =>
      logic
        .updateUser(userId, name, surname, email, password)
        .then(() => res.status(201).json({ message: 'Ok, user updated. ' })),
    res
  );
});

router.delete('/users', auth, (req, res) => {
  const { userId } = req;

  handleErrors(
    () =>
      logic.deleteUser(userId).then(() => res.status(201).json({ message: 'Ok, user deleted. ' })),
    res
  );
});

router.get('/users', auth, (req, res) => {
  const { userId } = req;

  handleErrors(
    () =>
      logic
        .retrieveUser(userId)
        .then(({ id, name, surname, email, privateNotes }) =>
          res.json({ id, name, surname, email, privateNotes })
        ),
    res
  );
});

router.post('/users/auth', jsonParser, (req, res) => {
  const {
    body: { email, password },
  } = req;

  handleErrors(async () => {
    const token = await logic.authenticateUser(email, password);
    res.json({ token });
  }, res);
});

module.exports = router;
