function apolloContext({ req }) {
  let tokenString = req.headers.authorization;
  if (typeof tokenString === "string") {
    tokenString = tokenString.split(" ")[1];
  } else {
    tokenString = null;
  }
  return { token: tokenString };
}

module.exports = apolloContext;