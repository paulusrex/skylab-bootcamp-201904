/**
 * 
 * @param {string} originalPassword Password to keep the secret
 * 
 * @returns {Object} with keepSecret(password, secretToKeep) and retreiveSecret(password)
 */
function safeBox(originalPassword) {
  var _secret;
  var keepSecret= function (password, secretToKeep) {
    if (password === originalPassword) {
      _secret = secretToKeep;
    }
  }
  var retreiveSecret = function (password) {
    if (password === originalPassword) {
      return _secret;
    }
    return undefined;
  }

  return {
    keepSecret : keepSecret,
    retreiveSecret : retreiveSecret
  };
}