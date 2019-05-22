//@ts-check
require('dotenv').config();

const logic = require('.');
const { LogicError, RequirementError, ValueError, FormatError } = require('../common/errors');
const duckApi = require('../data/duck-api');
const userData = require('../data/user-data');
const atob = require('atob');
const uuid = require('uuid/v4');

const { MongoClient, ObjectId } = require('mongodb');

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
  const url = 'mongodb://localhost/rest-api-test';
  let client, db, col;

  beforeAll(async () => {
    client = await MongoClient.connect(url, { useNewUrlParser: true });
    db = client.db();
    col = userData.__col__ = db.collection('users');
  });
  afterAll(() => client.close());
  beforeEach(async () => {
    users = newUsers();
    return col.deleteMany();
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
        const _users = await userData.find(baseUser);
        expect(_users).toHaveLength(1);
        expect(_users[0]).toMatchObject(baseUser);
      });

      it('should fail on retrying to register', async () => {
        await col.insertOne(users[0]);
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
      beforeEach(() => col.insertMany(users));

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
      beforeEach(() => col.insertMany(users));

      it('should succeed on correct user id and token', async () => {
        const id = users[0]._id.toString();
        const _user = await logic.retrieveUser(id);
        expect(_user.id).toBeDefined();
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBeUndefined();
      });

      it('should fail on non-existing user', async () => {
        const id = users[0]._id
          .toString()
          .split('')
          .reverse()
          .join('');
        try {
          const _user = await logic.retrieveUser(id);
          throw Error('should not reach this point');
        } catch (error) {
          expect(error).toBeDefined();
          expect(error).toBeInstanceOf(LogicError);
          expect(error.message).toBe(`user with id "${id}" does not exists`);
        }
      });
    });

    describe('update user', () => {
      let id;
      beforeEach(async () => {
        await col.insertMany(users);
        id = users[0]._id.toString();
      });

      it('should succeed on update name ', async () => {
        const randomName = 'new test name';
        await logic.updateUser(id, randomName);
        const _user = await userData.retrieve(id);
        expect(_user.name).toBe(randomName);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBe(password);
      });

      it('should succeed on update surname ', async () => {
        const randomSurname = 'new test surname';
        await logic.updateUser(id, undefined,  randomSurname);
        const _user = await userData.retrieve(id);
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(randomSurname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBe(password);
      });

      it('should succeed on update email ', async () => {
        const randomEmail = 'new-test-email-' + email;
        await logic.updateUser(id, undefined, undefined, randomEmail);
        const _user = await userData.retrieve(id);
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(randomEmail);
        expect(_user.password).toBe(password);
      });

      it('should succeed on update password ', async () => {
        const randomPassword = 'new-test-password';
        await logic.updateUser(id, undefined, undefined, undefined, randomPassword);
        const _user = await userData.retrieve(id);
        expect(_user.name).toBe(name);
        expect(_user.surname).toBe(surname);
        expect(_user.email).toBe(email);
        expect(_user.password).toBe(randomPassword);
      });
    });

    fdescribe('delete user', () => {
      let id;
      beforeEach(async () => {
        await col.insertMany(users);
        id = users[0]._id.toString();
      });

      it('should succeed on delete an user ', async () => {
        await logic.deleteUser(id)
        const _user = await userData.retrieve(id);
        expect(_user).toBeNull();
      });
    });

    describe('toggle fav duck', () => {
      let id, duckId;

      beforeEach(() =>
        fs
          .writeFile(userData.__file__, '[]')
          .then(() => userData.create({ name, surname, email, password }))
          .then(user => (id = user.id))
          .then(() => duckApi.searchDucks(''))
          .then(ducks => ducks[Math.floor(Math.random() * ducks.length)])
          .then(duck => (duckId = duck.id))
      );

      it('should succeed adding fav on first time', () =>
        logic
          .toggleFavDuck(id, duckId)
          .then(response => expect(response).toBeUndefined())
          .then(() => userData.retrieve(id))
          .then(({ favs }) => {
            expect(favs).toBeDefined();
            expect(favs).toBeInstanceOf(Array);
            expect(favs.length).toBe(1);
            expect(favs[0]).toBe(duckId);
          }));

      it('should succeed removing fav on second time', () =>
        logic
          .toggleFavDuck(id, duckId)
          .then(() => logic.toggleFavDuck(id, duckId))
          .then(() => userData.retrieve(id))
          .then(({ favs }) => {
            expect(favs).toBeDefined();
            expect(favs).toBeInstanceOf(Array);
            expect(favs.length).toBe(0);
          }));

      it('should fail on null duck id', () => {
        duckId = null;

        expect(() => logic.toggleFavDuck(duckId)).toThrowError(
          new RequirementError('userId is not optional')
        );
      });

      // TODO more cases
    });

    describe('retrieve fav ducks', () => {
      let id, user, duckIds;

      beforeEach(() =>
        fs
          .writeFile(userData.__file__, '[]')
          .then(() => userData.create({ name, surname, email, password }))
          .then(_user => (user = _user))
          .then(_user => (id = _user.id))
          .then(() => duckApi.searchDucks(''))
          .then(ducks => ducks.map(duck => (Math.random() < 0.2 ? duck.id : null)))
          .then(_duckIds => (duckIds = _duckIds.filter(id => !!id)))
          .then(() => userData.update(id, { favs: duckIds }))
      );

      it('should succeed retrieving all ducks with detail', () =>
        logic.retrieveFavDucks(id).then(favs => {
          favs.forEach(({ id, title, imageUrl, description, price }) => {
            const isFav = favs.some(fav => fav.id === id);

            expect(isFav).toBeTruthy();
            expect(typeof title).toBe('string');
            expect(title.length).toBeGreaterThan(0);
            expect(typeof imageUrl).toBe('string');
            expect(imageUrl.length).toBeGreaterThan(0);
            expect(typeof description).toBe('string');
            expect(description.length).toBeGreaterThan(0);
            expect(typeof price).toBe('string');
            expect(price.length).toBeGreaterThan(0);
          });
        }));
    });
  });

  describe('ducks', () => {
    describe('search ducks', () => {
      it('should succeed on correct query', () =>
        logic.searchDucks('yellow').then(ducks => {
          expect(ducks).toBeDefined();
          expect(ducks instanceof Array).toBeTruthy();
          expect(ducks.length).toBe(13);
        }));

      // TODO other cases
    });
  });
});
