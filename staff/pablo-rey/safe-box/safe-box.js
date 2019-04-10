/**
 * 
 * @param {string} originalPassword Password to keep the secret
 * 
 * @returns {Object} with keepSecret(password, secretToKeep) and retreiveSecret(password)
 */


function safeBox() {
  var __internal = safeBoxInternal('123');
  return function (password, secretOrPassword, mustChangePassword) {
    if (!__internal.checkPassword(password)) throw Error('wrong password');
    switch (arguments.length){
      case 1:
        return __internal.retreiveSecret(password);
      case 2:
        __internal.keepSecret(password, secretOrPassword);
        return true;
      case 3:
        if (mustChangePassword) {
          return __internal.changePassword(password, secretOrPassword);
        }
        return false;
    }
  };
}


function safeBoxInternal(originalPassword) {
  var _secret;
  var _actualPassword = originalPassword;

  var checkPassword = function (passwordToCheck) {
    return _actualPassword === passwordToCheck;
  }

  var changePassword = function (oldPassword, newPassword) {
    if (checkPassword(oldPassword)) {
      _actualPassword = newPassword;
      return true;
    }
    return false;
  }

  var keepSecret= function (password, secretToKeep) {
    if (password === _actualPassword) {
      _secret = secretToKeep;
    }
  }
  var retreiveSecret = function (password) {
    if (password === _actualPassword) {
      return _secret;
    }
    return undefined;
  }

  return {
    keepSecret : keepSecret,
    retreiveSecret : retreiveSecret,
    checkPassword: checkPassword,
    changePassword: changePassword
  };
}