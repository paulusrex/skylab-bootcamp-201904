//@ts-check
const userData = require('.');
const uuid = require('uuid/v4');

const { MongoClient, ObjectId } = require('mongodb');

describe('user data', () => {
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
    return await col.deleteMany();
  });

  describe('create', () => {
    it('should succeed on correct data', async () => {
      const user = {
        name: 'Test',
        surname: 'testing',
        email: `${uuid()}@mail.com`,
        password: '123',
      };

      const _user = await userData.create(user);
      expect(user._id).toBeInstanceOf(ObjectId);

      const cursor = await col.find();
      const users = await cursor.toArray();
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(user);
    });
  });

  describe('list', () => {
    const users = newUsers();
    beforeEach(() => col.insertMany(users));

    it('should succeed and return items if users exist', async () => {
      const _users = await userData.list();
      expect(_users).toHaveLength(users.length);
      expect(_users).toEqual(users);
    });
  });

  describe('retrieve', () => {
    beforeEach(() => col.insertMany(users));

    it('should succeed on an already existing user', async () => {
      const user = await userData.retrieve(users[0]._id.toString());
      expect(user).toBeDefined();
      expect(user).toEqual(users[0]);
    });
  });

  describe('update', () => {
    beforeEach(() => col.insertMany(users));

    it('should update an existing user', async () => {
      const { _id } = users[0];

      const updatingFields = { name: uuid() };
      const expected = { ...users[0], ...updatingFields };
      const result = await userData.update(_id.toString(), updatingFields);
      expect(result).toBe(1);

      const user = await col.findOne({ _id });
      expect(user).toEqual(expected);
    });
  });

  describe('delete', () => {
    beforeEach(() => col.insertMany(users));

    it('should succeed on matching existing users', async () => {
      const { _id } = users[0];
      const result = await userData.delete(_id.toString());
      expect(result).toBe(1);

      const user = await col.findOne({ _id });
      expect(user).toBeNull();

      const cursor = await col.find();
      const _users = await cursor.toArray();
      expect(_users).toHaveLength(users.length - 1);
      expect(_users.some(_user => _user._id.toString() === _id.toString())).toBeFalsy();
    });
  });

  describe('find', () => {
    beforeEach(() => col.insertMany(users));

    it('should succeed on matching existing users', async () => {
      const _users = await col.find({ name: 'Jane' }).toArray();
      expect(_users).toBeDefined();
      expect(_users).toBeInstanceOf(Array);
      expect(_users).toHaveLength(2);
      expect(_users).toEqual(users.filter(user => user.name === 'Jane'));
    });

  });
});
