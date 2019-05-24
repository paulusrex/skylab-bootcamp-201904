require('dotenv').config();
const chai = require('chai'),
  expect = chai.expect;

const mongoose = require('mongoose');
const uuid = require('uuid/v4');

const { LogicError, RequirementError, ValueError, FormatError } = require('../common/errors');
const logic = require('.');
const atob = require('atob');

const User = require('../models/user');
const Note = require('../models/note');

mongoose.connect(process.env.MONGO_URL_TEST, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', err => console.error('MongoDB connection error'));

describe('logic', () => {
  function newUsers() {
    return [
      {
        name: 'Jane',
        surname: 'Doe',
        email: uuid() + '@mail.com',
        password: '123',
      },
      {
        name: 'John',
        surname: 'Doe',
        email: uuid() + '@mail.com',
        password: '123',
      },
      {
        name: 'Jane',
        surname: 'Smith',
        email: uuid() + '@mail.com',
        password: '123',
      },
    ];
  }
  let users;

  before(done => {
    db.once('open', async () => {
      done();
    });
  });
  after(() => db.close());
  beforeEach(async () => {
    users = newUsers();
    await User.deleteMany();
    await Note.deleteMany();
  });

  describe('users', () => {
    let name, surname, email, password;

    beforeEach(() => {
      name = users[0].name;
      surname = users[0].surname;
      email = users[0].email;
      password = users[0].password;
    });
    describe('register user', () => {
      it('should succeed on correct user data', async () => {
        const baseUser = { name, surname, email };
        await logic.registerUser(name, surname, email, password);
        const _users = await User.find(baseUser);
        expect(_users).to.have.lengthOf(1);
        expect(_users[0]).to.deep.include(baseUser);
      });

      it('should fail on retrying to register', async () => {
        await User.create(users[0]);
        try {
          await logic.registerUser(name, surname, email, password);
          throw Error('should not reach this point');
        } catch (error) {
          expect(error).to.be.an.instanceOf(LogicError);
          expect(error.message).to.equal(`user with email \"${email}\" already registered`);
        }
      });

      it('should fail on undefined name', () => {
        const name = undefined;

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          RequirementError,
          `name is not optional`
        );
      });

      it('should fail on null name', () => {
        const name = null;

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          RequirementError,
          `name is not optional`
        );
      });

      it('should fail on empty name', () => {
        const name = '';

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          ValueError,
          'name is empty'
        );
      });

      it('should fail on blank name', () => {
        const name = ' \t    \n';

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          ValueError,
          'name is empty'
        );
      });

      it('should fail on undefined surname', () => {
        const surname = undefined;

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          RequirementError,
          `surname is not optional`
        );
      });

      it('should fail on null surname', () => {
        const surname = null;

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          RequirementError,
          `surname is not optional`
        );
      });

      it('should fail on empty surname', () => {
        const surname = '';

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          ValueError,
          'surname is empty'
        );
      });

      it('should fail on blank surname', () => {
        const surname = ' \t    \n';

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          ValueError,
          'surname is empty'
        );
      });

      it('should fail on undefined email', () => {
        const email = undefined;

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          RequirementError,
          `email is not optional`
        );
      });

      it('should fail on null email', () => {
        const email = null;

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          RequirementError,
          `email is not optional`
        );
      });

      it('should fail on empty email', () => {
        const email = '';

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          ValueError,
          'email is empty'
        );
      });

      it('should fail on blank email', () => {
        const email = ' \t    \n';

        expect(() => logic.registerUser(name, surname, email, password)).to.throw(
          ValueError,
          'email is empty'
        );
      });

      it('should fail on non-email email', () => {
        const nonEmail = 'non-email';

        expect(() => logic.registerUser(name, surname, nonEmail, password)).to.throw(
          FormatError,
          `${nonEmail} is not an e-mail`
        );
      });
    });

    describe('authenticate user', () => {
      let id;
      beforeEach(async () => {
        await User.insertMany(users);
        const user = await User.findOne({ email });
        id = user._id.toString();
      });

      it('should succeed on correct user credential', () =>
        logic.authenticateUser(email, password).then(token => {
          expect(token).to.be.an('string');
          expect(token).to.have.length.greaterThan(0);

          const [, payloadB64] = token.split('.');
          const payloadJson = atob(payloadB64);
          const payload = JSON.parse(payloadJson);

          expect(payload.sub).to.equal(id);
        }));

      it('should fail on non-existing user', () =>
        logic
          .authenticateUser((email = 'unexisting-user@mail.com'), password)
          .then(() => {
            throw Error('should not reach this point');
          })
          .catch(error => {
            expect(error).not.to.be.undefined;
            expect(error).to.be.an.instanceOf(LogicError);
            expect(error.message).to.equal(`user with email "${email}" does not exist`);
          }));

      it('should fail on non-existing user', () =>
        logic
          .authenticateUser(email, 'wrong-password')
          .then(() => {
            throw Error('should not reach this point');
          })
          .catch(error => {
            expect(error).not.to.be.undefined;
            expect(error).to.be.an.instanceOf(LogicError);
            expect(error.message).to.equal(`wrong credentials`);
          }));
    });

    describe('retrieve user', () => {
      let id;
      beforeEach(async () => {
        await User.insertMany(users);
        const user = await User.findOne({ email });
        id = user._id.toString();
      });

      it('should succeed on correct user id and token', async () => {
        const _user = await logic.retrieveUser(id);
        expect(_user.id).not.to.be.undefined;
        expect(_user.name).to.equal(name);
        expect(_user.surname).to.equal(surname);
        expect(_user.email).to.equal(email);
        expect(_user.password).to.be.undefined;
      });

      it('should fail on non-existing user', async () => {
        const _id = id
          .toString()
          .split('')
          .reverse()
          .join('');
        try {
          const _user = await logic.retrieveUser(_id);
          throw Error('should not reach this point');
        } catch (error) {
          expect(error).not.to.be.undefined;
          expect(error).to.be.an.instanceOf(LogicError);
          expect(error.message).to.equal(`user with id "${_id}" does not exists`);
        }
      });
    });

    describe('update user', () => {
      let id;
      beforeEach(async () => {
        await User.insertMany(users);
        const user = await User.findOne({ email });
        id = user._id.toString();
      });

      it('should succeed on update name ', async () => {
        const randomName = 'new test name';
        await logic.updateUser(id, randomName);
        const _user = await User.findById(id);
        expect(_user.name).to.equal(randomName);
        expect(_user.surname).to.equal(surname);
        expect(_user.email).to.equal(email);
        expect(_user.password).to.equal(password);
      });

      it('should succeed on update surname ', async () => {
        const randomSurname = 'new test surname';
        await logic.updateUser(id, undefined, randomSurname);
        const _user = await User.findById(id);
        expect(_user.name).to.equal(name);
        expect(_user.surname).to.equal(randomSurname);
        expect(_user.email).to.equal(email);
        expect(_user.password).to.equal(password);
      });

      it('should succeed on update email ', async () => {
        const randomEmail = 'new-test-email-' + email;
        await logic.updateUser(id, undefined, undefined, randomEmail);
        const _user = await User.findById(id);
        expect(_user.name).to.equal(name);
        expect(_user.surname).to.equal(surname);
        expect(_user.email).to.equal(randomEmail);
        expect(_user.password).to.equal(password);
      });

      it('should succeed on update password ', async () => {
        const randomPassword = 'new-test-password';
        await logic.updateUser(id, undefined, undefined, undefined, randomPassword);
        const _user = await User.findById(id);
        expect(_user.name).to.equal(name);
        expect(_user.surname).to.equal(surname);
        expect(_user.email).to.equal(email);
        expect(_user.password).to.equal(randomPassword);
      });
    });

    describe('delete user', () => {
      let id;
      beforeEach(async () => {
        await User.insertMany(users);
        const user = await User.findOne({ email });
        id = user._id.toString();
      });

      it('should succeed on delete an user ', async () => {
        await logic.deleteUser(id);
        const _user = await User.findById(id);
        expect(_user).to.be.null;
      });
    });
  });

  describe('notes', () => {
    const ipsumText = [
      'Lorem fistrum te voy a borrar el cerito al ataquerl está la cosa muy malar diodenoo pupita hasta luego Lucas ese que llega.',
      'Diodenoo mamaar de la pradera apetecan diodeno.',
      'Diodeno al ataquerl apetecan te voy a borrar el cerito.',
      'Ese hombree amatomaa va usté muy cargadoo jarl tiene musho peligro se calle ustée de la pradera de la pradera ese hombree diodeno benemeritaar.',
      'Fistro ese hombree quietooor hasta luego Lucas no puedor.',
      'La caidita benemeritaar a gramenawer condemor me cago en tus muelas al ataquerl no te digo trigo por no llamarte Rodrigor no puedor tiene musho peligro.',
      'Pupita diodeno no te digo trigo por no llamarte Rodrigor pupita tiene musho peligro.',
      'A gramenawer mamaar pecador a peich llevame al sircoo caballo blanco caballo negroorl benemeritaar torpedo ese que llega diodenoo.',
      'La caidita quietooor papaar papaar torpedo diodenoo benemeritaar amatomaa me cago en tus muelas va usté muy cargadoo.',
      'Llevame al sircoo no te digo trigo por no llamarte Rodrigor torpedo a peich ese hombree la caidita la caidita a gramenawer torpedo benemeritaar sexuarl.',
      'Al ataquerl papaar papaar quietooor ese hombree la caidita mamaar ese que llega no te digo trigo por no llamarte Rodrigor ese pedazo de.',
      'Pupita la caidita pecador por la gloria de mi madre a wan llevame al sircoo pupita quietooor de la pradera mamaar apetecan.',
      'Ese pedazo de a wan de la pradera a peich a peich condemor caballo blanco caballo negroorl ese hombree',
    ];
    const randomText = () =>
      new Array(Math.ceil(Math.random() * 8))
        .fill(' ')
        .map(() => ipsumText[Math.floor(Math.random() * ipsumText.length)])
        .join(' ');

    let user;
    beforeEach(async () => {
      await User.insertMany(users);
      user = await User.findOne({ email: users[0].email });
    });

    it('should create a note with correct data', async () => {
      const text = randomText();
      await logic.createNewNote(user, text, new Date());
      const _notes = await Note.find();
      expect(_notes).to.have.lengthOf(1);
      const _note = _notes[0];
      expect(_note.text).to.equal(text);
      expect(_note.author._id.toString()).to.equal(user._id.toString());
    });

    describe('multiple notes', () => {
      let notes;
      beforeEach(async () => {
        notes = [];
        for (let ii = 0; ii < 10; ii++) {
          const text = randomText();
          notes.push(await logic.createNewNote(user, text, new Date()));
        }
      });

      it('should retrieve all notes', async () => {
        const _notes = await Note.find();
        expect(_notes).to.have.lengthOf(notes.length);
        _notes.forEach(async _note => {
          const note = _notes.find(__note => __note._id.toString() === _note._id.toString());
          expect(note.text).to.equal(_note.text);
          expect(note.author.toString()).to.equal(_note.author._id.toString());
          expect(note.date).to.equal(note.date);
        });
      });

      it('should retrieve a note', async () => {
        const expectedNote = notes[Math.floor(Math.random() * notes.length)];
        const note = await logic.retrieveNote(expectedNote._id.toString());
        expect(note.text).to.equal(expectedNote.text);
        expect(note.author.toString()).to.equal(expectedNote.author._id.toString());
        expect(note.date.getTime()).to.equal(expectedNote.date.getTime());
      });

      it('should update the text of a note', async () => {
        const index = Math.floor(Math.random() * notes.length);
        const _idToUpdate = notes[index]._id;
        const expectedText = randomText();

        await logic.updateNote(_idToUpdate.toString(), { text: expectedText });

        const _note = await Note.findById(_idToUpdate);
        expect(_note).not.to.be.null;
        expect(_note.text).to.equal(expectedText);

        const _notes = await Note.find();
        expect(_notes).to.have.lengthOf(notes.length);
        _notes.forEach(async _note => {
          const note = _notes.find(__note => __note._id.toString() === _note._id.toString());
          expect(note.author.toString()).to.equal(_note.author._id.toString());
          expect(note.date).to.equal(note.date);
          if (_note._id.toString() !== _idToUpdate) {
            expect(note.text).to.equal(_note.text);
          } else {
            expect(note.text.to.equal(expectedText));
          }
        });
      });

      it('should delete a note', async () => {
        const index = Math.floor(Math.random() * notes.length);
        const _idToDelete = notes[index]._id;
        await logic.deleteNote(_idToDelete.toString());
        
        const _note = await Note.findById(_idToDelete);
        expect(_note).to.be.null;

        const _notes = await Note.find();
        expect(_notes).to.have.lengthOf(notes.length - 1);
        notes.splice(index);
        _notes.forEach(async _note => {
          const note = _notes.find(__note => __note._id.toString() === _note._id.toString());
          expect(note.text).to.equal(_note.text);
          expect(note.author.toString()).to.equal(_note.author._id.toString());
          expect(note.date).to.equal(note.date);
        });
      });
    });
  });
});
