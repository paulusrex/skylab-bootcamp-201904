const express = require('express');
const logic = require('../logic');
const handleErrors = require('./handle-errors');
const auth = require('./auth');

const router = express.Router();

router.post('/ducks/:id/fav', auth, (req, res) => {
  const {
    userId,
    params: { id },
  } = req;

  handleErrors(
    () => logic.toggleFavDuck(userId, id).then(() => res.json({ message: 'Ok, duck toggled.' })),
    res
  );
});

router.get('/ducks/fav', auth, (req, res) => {
  const { userId } = req;
  handleErrors(() => logic.retrieveFavDucks(userId).then(ducks => res.json(ducks)), res);
});

router.get('/ducks', auth, (req, res) => {
  const {
    userId,
    query: { query },
  } = req;

  handleErrors(() => logic.searchDucks(query).then(ducks => res.json(ducks)), res);
});

router.get('/ducks/:id', auth, (req, res) => {
  const {
    userId,
    params: { id },
  } = req;
  handleErrors(() => logic.retrieveDuck(id).then(duck => res.json(duck)), res);
});

module.exports = router;
