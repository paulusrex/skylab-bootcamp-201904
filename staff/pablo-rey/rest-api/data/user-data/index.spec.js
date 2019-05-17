const userData = require('.');
const fs = require('fs').promises;
const path = require('path');
const uuid = require('uuid/v4');

userData.__file__ = path.join(__dirname, 'users_tst.json');

describe('user data', () => {
  const users = [
    {
      id: uuid(),
      name: 'Jane',
      surname: 'Doe',
      email: uuid() + '@mail.com',
      password: '123',
    },
    {
      id: uuid(),
      name: 'John',
      surname: 'Doe',
      email: uuid() + '@mail.com',
      password: '123',
    },
    {
      id: uuid(),
      name: 'Jane',
      surname: 'Smith',
      email: uuid() + '@mail.com',
      password: '123',
    },
  ];

  beforeEach(() => userData.__users__ = undefined)
  afterAll(() => fs.writeFile(userData.__file__, '[]'));

  describe('create', () => {
    beforeEach(() => fs.writeFile(userData.__file__, '[]'));

    it('should succeed on correct data', () => {
      const user = {
        name: 'Test',
        surname: 'testing',
        email: uuid() + '@mail.com',
        password: '123',
      };

      return userData
        .create(user)
        .then(_user => {
          expect(_user).toEqual(user);
          expect(typeof user.id).toBe('string');
          return fs.readFile(userData.__file__, 'utf8');
        })
        .then(JSON.parse)
        .then(users => {
          expect(users).toHaveLength(1);
          const [_user] = users;
          expect(_user).toEqual(user);
        });
    });
  });

  describe('list', () => {
    beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)));

    it('should succeed and return items if users exist', () => {
      userData.list().then(_users => {
        expect(_users).toHaveLength(users.length);
        expect(_users).toEqual(users);
      });
    });
  });

  describe('retrieve', () => {
    beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)));

    it('should succeed on an already existing user', () =>
      userData.retrieve(users[0].id).then(user => {
        expect(user).toBeDefined();
        expect(user).toEqual(users[0]);
      }));
  });

  describe('update', () => {
    beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)));

    it('should update an existing user', () => {
      const updatingText = uuid();
      const updatingFields = { name: updatingText };
      return userData
        .update(users[0].id, updatingFields)
        .then(_user => {
          expect(_user).toBeDefined();
          expect(_user).toMatchObject(updatingFields);
          expect(_user).toEqual({ ...users[0], ...updatingFields });
        })
        .then(() => fs.readFile(userData.__file__, 'utf8').then(JSON.parse))
        .then(_users => {
          expect(_users).toHaveLength(users.length);
          expect(_users).toContainEqual({ ...users[0], ...updatingFields });
        });
    });
  });

  describe('delete', () => {
    beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)));

    it('should succeed on matching existing users', () =>
      userData.delete(users[0].id).then(user => {
        expect(user).toBeDefined();
        expect(users[0]).toEqual(user);
        return fs
          .readFile(userData.__file__, 'utf8')
          .then(JSON.parse)
          .then(_users => {
            expect(_users).toHaveLength(users.length - 1);
            expect(_users).not.toContainEqual(user);
          });
      }));
  });

  describe('find', () => {
    beforeEach(() => fs.writeFile(userData.__file__, JSON.stringify(users)));

    it('should succeed on matching existing users', () =>
      userData.find({ name: 'Jane' }).then(_users => {
        expect(_users).toBeDefined();
        expect(_users).toBeInstanceOf(Array);
        expect(_users).toHaveLength(2);
        expect(_users).toEqual(users.filter(user => user.name === 'Jane'));
      }));

    it('should succeed on matching existing users, with criteria as function', () => {
      const criteria = user => user.name === 'Jane';
      return userData.find(criteria).then(_users => {
        expect(_users).toBeDefined();
        expect(_users).toBeInstanceOf(Array);
        expect(_users).toHaveLength(2);
        expect(_users).toEqual(users.filter(user => user.name === 'Jane'));
      });
    });
  });
});
