const { AuthenticationError } = require('apollo-server');
const logic = require('../../logic')


function apolloContext({ req }) {
  const {
    headers: { authorization },
  } = req;
  // if (!authorization) throw new AuthenticationError();

  let token = authorization;
  if (typeof token === "string") {
    token = token.split(" ")[1];
  } else {
    token = null;
  }
  // if (!token) throw new AuthenticationError();

  const { sub } = logic.verifyToken(token);
  return { token, userId: sub };
}

module.exports = apolloContext;