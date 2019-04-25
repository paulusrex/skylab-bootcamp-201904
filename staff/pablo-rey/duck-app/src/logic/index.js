import validate from '../common/validate'
import normalize from '../common/normalize'
import userApi from '../data/user-api'
import duckApi from '../data/duck-api'
import { LogicError, FormatError } from '../common/errors'

const logic = {
  /**
   *
   * @param {string} name
   * @param {string} surname
   * @param {string} email
   * @param {string} password
   * @param {Function} callback
   */
  registerUser(name, surname, email, password, callback) {
    validate.arguments([
      { name: "name", value: name, type: "string", notEmpty: true },
      { name: "surname", value: surname, type: "string", notEmpty: true },
      { name: "email", value: email, type: "string", notEmpty: true },
      { name: "password", value: password, type: "string", notEmpty: true },
    ]);

    validate.email(email);

    return userApi.create(name, surname, email, password)
      .then(response => {
          if (response.status === "OK") return undefined;
          throw new LogicError(response.error);
    });
  },

  /**
   *
   * @param {string} email
   * @param {string} password
   * @param {Function} callback
   */
  loginUser(email, password, callback) {
    validate.arguments([
      { name: "email", value: email, type: "string", notEmpty: true },
      { name: "password", value: password, type: "string", notEmpty: true },
    ]);

    return userApi.authenticate(email, password)
      .then(response => {
        if (response.error) throw new LogicError(response.error);
        const { data: { id: userId, token }} = response;
        this.__userId__ = userId;
        this.__token__ = token;
        return undefined;
      }
    );
  },

  /**
   *
   * @param {string} id
   * @param {string} token
   * @param {Function} callback
   */
  retrieveUser() {

    return userApi.retrieve(logic.__userId__, logic.__token__)
      .then(response => {
        if (response.status !== "OK")  throw new LogicError(response.error);
        const { name, surname, username: email } = response.data;
        return { name, surname, email };
    });
  },

  logout() {
    this.__userId__ = null;
    this.__token__ = null;
  },

  get isLogged() {
    return !!(this.__userId__ && this.__token__);
  },

  get __userId__() {
    return normalize.undefinedOrNull(sessionStorage.__userId__);
  },
  set __userId__(id) {
    sessionStorage.__userId__ = id;
  },

  get __token__() {
    return normalize.undefinedOrNull(sessionStorage.__token__);
  },
  set __token__(token) {
    sessionStorage.__token__ = token;
  },

  searchDucks(query) {
    // TODO validate inputs

    // TODO handle api errors
    return duckApi.searchDucks(query);
  },

  retrieveDuck(id) {
    // TODO validate inputs

    // TODO handle api errors
    return duckApi.retrieveDuck(id);
  },
};

export default logic