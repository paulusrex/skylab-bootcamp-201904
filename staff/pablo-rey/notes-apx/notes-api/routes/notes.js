//@ts-check
const express = require('express');
const bodyParser = require('body-parser');
const logic = require('../logic');
const { ValueError, UnauthorizedError } = require('../common/errors');
const handleErrors = require('./handle-errors');
const auth = require('./auth');

const jsonParser = bodyParser.json();

const router = express.Router();

router.get('/notes/:id', auth, (req, res) => {
  const {
    params: { id },
  } = req;
  handleErrors(async () => {
    const { author, text, date, parent } = await logic.retrieveNote(id);
    res.json({ id, author, text, date, parent });
  }, res);
});

router.get('/notes', auth, (req, res) => {
  handleErrors(async () => {
    const notes = await logic.allNotes();
    res.json(notes.map(({ _id, author, text, date }) => ({ id: _id, author, text, date })));
  }, res);
});

router.post('/notes', auth, jsonParser, (req, res) => {
  const {
    body: { text },
  } = req;

  handleErrors(async () => {
    const note = await logic.createNewNote(await logic.retrieveUser(req.userId), text, new Date());
    res.status(201).json({ id: note._id.toString(), message: 'Ok, note created.' });
  }, res);
});

router.post('/notes/private', auth, jsonParser, (req, res) => {
  const {
    body: { text },
    userId,
  } = req;

  handleErrors(async () => {
    const note = { text, date: new Date() };
    const result = await logic.addPrivateNote(userId, note);
    res.status(201).json({ message: 'Ok, note created.' });
  }, res);
});

router.put('/notes/:id', auth, jsonParser, (req, res) => {
  const {
    body: { text, date },
    params: { id },
    userId,
  } = req;

  handleErrors(async () => {
    const note = await logic.retrieveNote(id);
    if (!note) throw new ValueError('note not found');
    if (note.author._id.toString() !== userId)
      throw new UnauthorizedError("You don't own this note");

    const noteData = {};
    if (text) noteData.text = text;
    if (date) noteData.date = date;
    await logic.updateNote(id, noteData);
    res.status(201).json({ message: 'Ok, note updated. ' });
  }, res);
});

router.delete('/notes/:id', auth, (req, res) => {
  const {
    params: { id },
    userId,
  } = req;

  handleErrors(async () => {
    const note = await logic.retrieveNote(id);
    if (!note) throw new ValueError('note not found');
    if (note.author._id.toString !== userId) throw new UnauthorizedError("You don't own this note");
    await logic.deleteNote(id);
    res.status(201).json({ message: 'Ok, note deleted. ' });
  }, res);
});

module.exports = router;
