//@ts-check
require('dotenv').config();

const logic = require('.');
const fs = require('fs').promises;
const { LogicError, RequirementError, ValueError, FormatError } = require('../common/errors');
// const userApi = require('../data/user-api');
const duckApi = require('../data/duck-api');
const userData = require('../data/user-data');
const path = require('path');
const atob = require('atob');

describe('logic', () => {
  const name = 'Manuel';
  const surname = 'Barzi';
  let email;
  const password = '123';

  beforeAll(() => (userData.__file__ = path.join(__dirname, 'users_tst.json')));
  beforeEach(() => {
    userData.__users__ = undefined;
    email = `test-${Math.random()}@gmail.com`;
  });
  afterAll(() => fs.writeFile(userData.__file__, '[]'));

  describe('users', () => {
    describe('register user', () => {
      beforeEach(() => fs.writeFile(userData.__file__, '[]'));

      it('should succeed on correct user data', () => {
        const baseUser = { name, surname, email };
        return logic.registerUser(name, surname, email, password).then(user => {
          expect(user).toBeDefined();
          expect(user).toMatchObject(baseUser);
          return userData.find(baseUser).then(users => {
            expect(users).toHaveLength(1);
            expect(users[0]).toMatchObject(baseUser);
          });
        });
      });

      describe('on already existing user', () => {
        beforeEach(() =>
          fs
            .writeFile(userData.__file__, '[]')
            .then(() => logic.registerUser(name, surname, email, password))
        );

        it('should fail on retrying to register', () =>
          logic
            .registerUser(name, surname, email, password)
            .then(() => {
              throw Error('should not reach this point');
            })
            .catch(error => {
              expect(error).toBeDefined();
              expect(error instanceof LogicError).toBeTruthy();

              expect(error.message).toBe(`user with email \"${email}\" already registered`);
            }));
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

      // TODO password fail cases
    });

    describe('authenticate user', () => {
      let id;
      beforeEach(() =>
        fs
          .writeFile(userData.__file__, '[]')
          .then(() => userData.create({ name, surname, email, password }))
          .then(user => (id = user.id))
      );

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
      beforeEach(() =>
        fs
          .writeFile(userData.__file__, '[]')
          .then(() => userData.create({ name, surname, email, password }))
          .then(user => (id = user.id))
      );

      it('should succeed on correct user id and token', () =>
        logic.retrieveUser(id).then(user => {
          expect(user.id).toBeDefined();
          expect(user.name).toBe(name);
          expect(user.surname).toBe(surname);
          expect(user.email).toBe(email);
          expect(user.password).toBeUndefined();
        }));

      it('should fail on non-existing user', () =>
        logic
          .retrieveUser('somewrongrandomid')
          .then(() => {
            throw Error('should not reach this point');
          })
          .catch(error => {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(LogicError);
            expect(error.message).toBe(`user with id "${'somewrongrandomid'}" does not exists`);
          }));
    });

    describe('update user', () => {
      let id;
      beforeEach(() =>
        fs
          .writeFile(userData.__file__, '[]')
          .then(() => userData.create({ name, surname, email, password }))
          .then(user => (id = user.id))
      );

      it('should succeed on update name ', () => {
        const randomName = 'new test name';
        return logic
          .updateUser(id, randomName)
          .then(() => userData.retrieve(id))
          .then(user => {
            expect(user.name).toBe(randomName);
            expect(user.surname).toBe(surname);
            expect(user.email).toBe(email);
            expect(user.password).toBe(password);
          });
      });

      it('should succeed on update surname ', () => {
        const randomSurname = 'new test surname';
        return logic
          .updateUser(id, undefined, randomSurname)
          .then(() => userData.retrieve(id))
          .then(user => {
            expect(user.name).toBe(name);
            expect(user.surname).toBe(randomSurname);
            expect(user.email).toBe(email);
            expect(user.password).toBe(password);
          });
      });

      it('should succeed on update email ', () => {
        const randomEmail = 'new-test-email-' + email;
        return logic
          .updateUser(id, undefined, undefined, randomEmail)
          .then(() => userData.retrieve(id))
          .then(user => {
            expect(user.name).toBe(name);
            expect(user.surname).toBe(surname);
            expect(user.email).toBe(randomEmail);
            expect(user.password).toBe(password);
          });
      });

      it('should succeed on update password ', () => {
        const randomPassword = 'new-test-password';
        return logic
          .updateUser(id, undefined, undefined, undefined, randomPassword)
          .then(() => userData.retrieve(id))
          .then(user => {
            expect(user.name).toBe(name);
            expect(user.surname).toBe(surname);
            expect(user.email).toBe(email);
            expect(user.password).toBe(randomPassword);
          });
      });
    });

    describe('delete user', () => {
      let id;
      beforeEach(() =>
        fs
          .writeFile(userData.__file__, '[]')
          .then(() => userData.create({ name, surname, email, password }))
          .then(user => (id = user.id))
      );

      it('should succeed on delete an user ', () => {
        return logic
          .deleteUser(id)
          .then(() => userData.list())
          .then(users => expect(users).toHaveLength(0));
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
