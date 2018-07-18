const jwt = require('jsonwebtoken'),
       Config = require('config') ;

let createToken = function(auth) {
  return jwt.sign({
    data: auth
  }, Config.JWT.secret,
  {
    expiresIn: Config.JWT.expire
  }
  );
};

let generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  next();
};

let sendToken = function (req, res) {
  res.status(200).send({
      token: req.token,
      prefix: Config.JWT.prefix,
      // expiresIn: Config.JWT.expire
  });
};

module.exports = {
    createToken,
    generateToken,
    sendToken
}