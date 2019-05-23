const handleErrors = require('./handle-errors');
const logic = require('../logic');
const { UnauthorizedError } = require('../common/errors');

module.exports = function(req, res, next) {
  handleErrors(
    () =>
      Promise.resolve().then(() => {
        const {
          headers: { authorization },
        } = req;

        if (!authorization) throw new UnauthorizedError();
        const token = authorization.slice(7);
        if (!token) throw new UnauthorizedError();

        const { sub } = logic.verifyToken(token);
        req.userId = sub;
        next();
      }),
    res
  );
};
