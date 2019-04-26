import logic from '.'
import userApi from '../data/user-api'
import { LogicError, ValueError, RequirementError, FormatError } from '../common/errors'

function randomString(length = 20) {
  return Number(Math.random() * 10 ** length).toString(35);
}

function generateRandomEmail() {
  return `test-${randomString()}@mail.com`;
}

describe("logic", () => {
  describe("users logic", () => {
    describe("register", () => {
      const name = "test";
      const surname = "test";
      let email;
      let password;

      beforeEach(() => {
        email = generateRandomEmail();
        password = randomString();
      });

      it("should succeed on correct user data", done => {
        logic
          .registerUser(name, surname, email, password)
          .then(response => {
            expect(response).toBeUndefined();
            done();
          })
          .catch(done);
      });

      describe("on already existing user", () => {
        it("should fail on retrying to register", done => {
          logic.registerUser(name, surname, email, password)
          .then(() => {
            logic
              .registerUser(name, surname, email, password)
              .then(() => done(Error("expected no response here")))
              .catch(error => {
                expect(error instanceof LogicError).toBeTruthy();
                expect(error.message).toBe(
                  `user with username \"${email}\" already exists`
                );
                done();
              });
          });
        });
      });

      describe("fail tests", () => {
        describe("fails for name", () => {
          it("should fail on undefined name", () => {
            const name = undefined;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `name is not optional`);
          });

          it("should fail on null name", () => {
            const name = null;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `name is not optional`);
          });

          it("should fail on empty name", () => {
            const name = "";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "name is empty");
          });

          it("should fail on blank name", () => {
            const name = " \t    \n";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "name is empty");
          });
        });

        describe("fails for surname", () => {
          it("should fail on undefined surname", () => {
            const surname = undefined;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `surname is not optional`);
          });

          it("should fail on null surname", () => {
            const surname = null;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `surname is not optional`);
          });

          it("should fail on empty surname", () => {
            const surname = "";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "surname is empty");
          });

          it("should fail on blank surname", () => {
            const surname = " \t    \n";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "surname is empty");
          });
        });

        describe("fails for email", () => {
          it("should fail on undefined email", () => {
            const email = undefined;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `email is not optional`);
          });

          it("should fail on null email", () => {
            const email = null;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `email is not optional`);
          });

          it("should fail on empty email", () => {
            const email = "";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "email is empty");
          });

          it("should fail on blank email", () => {
            const email = " \t    \n";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "email is empty");
          });

          it("should fail on non-email email", () => {
            const nonEmail = "non-email";
            expect(() =>
              logic.registerUser(name, surname, nonEmail, password)
            ).toThrowError(FormatError, `${nonEmail} is not an e-mail`);
          });
        });

        describe("fails for password", () => {
          it("should fail on undefined password", () => {
            const password = undefined;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `password is not optional`);
          });

          it("should fail on null password", () => {
            const password = null;

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(RequirementError, `password is not optional`);
          });

          it("should fail on empty password", () => {
            const password = "";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "password is empty");
          });

          it("should fail on blank password", () => {
            const password = " \t    \n";

            expect(() =>
              logic.registerUser(name, surname, email, password)
            ).toThrowError(ValueError, "password is empty");
          });
        });
      });
    });

    describe("login", () => {
      const name = "test";
      const surname = "test";
      let email;
      let password;

      beforeAll(() => {
        email = generateRandomEmail();
        password = randomString();
        return userApi.create(name, surname, email, password);
      });

      beforeEach(() => {
        logic.__userId__ = undefined;
        logic.__token__ = undefined;
      });

      it("should succeed on correct user data", done => {
        logic.loginUser(email, password)
          .then(() => {
            expect(typeof logic.__userId__).toBe("string");
            expect(typeof logic.__token__).toBe("string");
            done();
          });
      });

      describe("should fail on wrong data", () => {
        it("should fail on wrong username", done => {
          const wrongEmail = generateRandomEmail();

          logic.loginUser(wrongEmail, password)
            .then(() => done(Error("expected no response here")))
            .catch(error => {
              expect(error.message).toBe(
                `user with username "${wrongEmail}" does not exist`
              );
              done();
            });
        });

        it("should fail on wrong password", done => {
          const wrongPassword = randomString();

          logic.loginUser(email, wrongPassword)
            .then(() => done(Error("expected no response here")))
            .catch(error => {
              expect(error.message).toBe("username and/or password wrong");
              done();
            });
        });
      });

      describe("fail tests", () => {
        describe("fails for email", () => {
          it("should fail on undefined email", () => {
            const email = undefined;

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(RequirementError, `email is not optional`);
          });

          it("should fail on null email", () => {
            const email = null;

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(RequirementError, `email is not optional`);
          });

          it("should fail on empty email", () => {
            const email = "";

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(ValueError, "email is empty");
          });

          it("should fail on blank email", () => {
            const email = " \t    \n";

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(ValueError, "email is empty");
          });
        });

        describe("fails for password", () => {
          it("should fail on undefined password", () => {
            const password = undefined;

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(RequirementError, `password is not optional`);
          });

          it("should fail on null password", () => {
            const password = null;

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(RequirementError, `password is not optional`);
          });

          it("should fail on empty password", () => {
            const password = "";

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(ValueError, "password is empty");
          });

          it("should fail on blank password", () => {
            const password = " \t    \n";

            expect(() =>
              logic.loginUser(email, password, () => {})
            ).toThrowError(ValueError, "password is empty");
          });
        });
      });
    });

    describe("retrieve user", () => {
      const name = "test";
      const surname = "test";
      let email;
      let password;

      beforeEach(() => {
        email = generateRandomEmail();
        password = randomString();
      });

      test("should retrieve correct data for user id",  () => 
        userApi.create(name, surname, email, password)
          .then(() => userApi.authenticate(email, password))
          .then(response => {
              logic.__userId__ = response.data.id;
              logic.__token__ = response.data.token;
          })
          .then(() => logic.retrieveUser())  
          .then(user => {
            expect(logic.__user__).toBe(user);
            expect(user.name).toBe(name);
            expect(user.surname).toBe(surname);
            expect(user.email).toBe(email);
          })
        );
    });

    describe("update", () => {
      const name = randomString();
      const surname = randomString();
      let username;
      const password = randomString();
      
      it("should succeed on correct user data", (done) => {
        let id;
        let token;
        let user;
        let fields;
        username = generateRandomEmail();
        return userApi.create(name, surname, username, password)
          .then(() => userApi.authenticate(username, password))
          .then(({ data }) => {
            id = logic.__userId__ = data.id;
            token = logic.__token__ = data.token;
          })
          .then(() => userApi.retrieve(id,token))
          .then(res => {
            user = res.data;
            fields = { 
              ...user, 
              testField: randomString(),
            }
            logic.__user__ = {...fields};
          })
          .then(() => logic.updateUser())
          .then(() => userApi.retrieve(id, token))
          .then((res) => {
            expect(res.data).toEqual(fields);
            done();
          });
      });
  
    });
  
  });

  describe("ducks", () => {
    describe("search ducks", () => {
      it("should succeed on correct query", done => {
        logic.searchDucks("yellow").then(ducks => {
          expect(ducks).toBeDefined();
          expect(ducks instanceof Array).toBeTruthy();
          expect(ducks.length).toBe(13);
          done();
        });

        // TODO fail cases
      });
    });
  });
});
