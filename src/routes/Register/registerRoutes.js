"use strict";
module.exports = function (app) {
  let register = require("../../controllers/registerController");
  let jwt = require("../../utils/jwtToken")

  app.route(`/wsTraslations/Register/wsIsValidUrlCode`).get(jwt.isValidToken,register.isValidUrlCode);

  app.route(`/wsTraslations/Register/wsRegisterNewUser`).post(jwt.isValidToken,register.registerNewUser);
};



