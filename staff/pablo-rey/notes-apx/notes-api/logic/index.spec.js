//@ts-check
require('dotenv').config();
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

  beforeAll(done => {
    db.once('open', async () => {
      done();
    });
  });
  afterAll(() => db.close());
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
        expect(_users).toHaveLength(1);
        expect(_users[0]).toMatchObject(baseUser);
      });

      it('should fail on retrying to register', async () => {
        await User.create(users[0]);
        try {
          await logic.registerUser(name, surname, email, password);
          throw Error('should not reach this point');
        } catch (error) {
          expect(error).toBeDefined();
          expect(error instanceof LogicError).toBeTruthy();

          expect(error.message).toBe(`user with email \"${email}\" already registered`);
        }
      });

      it('should fail on undefined name', () => {
        const name = undefined;

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new RequirementError(`name is not optional`)
        );
      });

      it('should fail on null name', () => {
        const name = null;

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new RequirementError(`name is not optional`)
        );
      });

      it('should fail on empty name', () => {
        const name = '';

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new ValueError('name is empty')
        );
      });

      it('should fail on blank name', () => {
        const name = ' \t    \n';

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new ValueError('name is empty')
        );
      });

      it('should fail on undefined surname', () => {
        const surname = undefined;

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new RequirementError(`surname is not optional`)
        );
      });

      it('should fail on null surname', () => {
        const surname = null;

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new RequirementError(`surname is not optional`)
        );
      });

      it('should fail on empty surname', () => {
        const surname = '';

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new ValueError('surname is empty')
        );
      });

      it('should fail on blank surname', () => {
        const surname = ' \t    \n';

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new ValueError('surname is empty')
        );
      });

      it('should fail on undefined email', () => {
        const email = undefined;

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new RequirementError(`email is not optional`)
        );
      });

      it('should fail on null email', () => {
        const email = null;

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new RequirementError(`email is not optional`)
        );
      });

      it('should fail on empty email', () => {
        const email = '';

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new ValueError('email is empty')
        );
      });

      it('should fail on blank email', () => {
        const email = ' \t    \n';

        expect(() => logic.registerUser(name, surname, email, password)).toThrowError(
          new ValueError('email is empty')
        );
      });

      it('should fail on non-email email', () => {
        const nonEmail = 'non-email';

        expect(() => logic.registerUser(name, surname, nonEmail, password)).toThrowError(
          new FormatError(`${nonEmail} is not an e-mail`)
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
          expect(typeof token).toBe('string');
          expect(token.length).toBeGreaterThan(0);

          const [, payloadB64] = token.split('.');
          const payloadJson = atob(payloadB64);
          const payload = JSON.parse(payloadJson);

          expect(payload.sub).toBe(id);
        }));

      it('should fail on non-existing user', () =>
        logic
          .authenticateUser((email = 'unexisting-user@mail.com'), password)
          .then(() => {
            throw Error('should not reach this point');
          })
          .catch(error => {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(LogicError);
            expect(error.message).toBe(`user with email "${email}" does not exist`);
          }));

      it('should fail on non-existing user', () =>
        logic
          .authenticateUser(email, 'wrong-password')
          .then(() => {
            throw Error('should not reach this point');
          })
          .catch(error => {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(LogicError);
            expect(error.message).toBe(`wrong credentials`);
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
        expect(_user.id).toBeDefined();
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBeUndefined();
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
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(LogicError);
          expect(error.message).toBe(`user with id "${_id}" does not exists`);
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
        expect(_user.name).toBe(randomName);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBe(password);
      });

      it('should succeed on update surname ', async () => {
        const randomSurname = 'new test surname';
        await logic.updateUser(id, undefined, randomSurname);
        const _user = await User.findById(id);
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(randomSurname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBe(password);
      });

      it('should succeed on update email ', async () => {
        const randomEmail = 'new-test-email-' + email;
        await logic.updateUser(id, undefined, undefined, randomEmail);
        const _user = await User.findById(id);
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(randomEmail);
        expect(_user.password).toBe(password);
      });

      it('should succeed on update password ', async () => {
        const randomPassword = 'new-test-password';
        await logic.updateUser(id, undefined, undefined, undefined, randomPassword);
        const _user = await User.findById(id);
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBe(randomPassword);
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
        expect(_user).toBeNull();
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
      'Al ataquerl papaar papaar quietooor ese hombree la caidita mamaar ese que llega no te digo trigo por no llamarte Rodrigor ese pedazo de.'
      ,'Pupita la caidita pecador por la gloria de mi madre a wan llevame al sircoo pupita quietooor de la pradera mamaar apetecan.',
      'Ese pedazo de a wan de la pradera a peich a peich condemor caballo blanco caballo negroorl ese hombree'
    ];
    const randomText = () =>
      new Array(Math.floor(Math.random() * 8))
        .fill(' ')
        .map(() => ipsumText[Math.floor(Math.random() * ipsumText.length)])
        .join(' ');

    describe('create', () => {
      let id, user;
      beforeEach(async () => {
        await User.insertMany(users);
        user = await User.findOne({email: users[0].email});
      });

      it('should create a note with correct data', async () => {
        const text = randomText();
        await logic.createNewNote(user, text, new Date());
        const _notes = await Note.find();
        expect(_notes).toHaveLength(1);
        const _note = _notes[0];
        expect(_note.text).toBe(text);
        expect(_note.author._id.toString()).toBe(user._id.toString())
      })

      fit('should retrieve all notes', async () => {
        for (let ii=0; ii < 10; ii++ ) {
        const text = randomText();
        await logic.createNewNote(user, text, new Date());
        }
        const _notes = await Note.find();
        expect(_notes).toHaveLength(1);
        const _note = _notes[0];
        expect(_note.text).toBe(text);
        expect(_note.author._id.toString()).toBe(user._id.toString())
      })
    })
  });
});
