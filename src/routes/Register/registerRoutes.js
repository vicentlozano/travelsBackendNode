"use strict";
module.exports = function (app) {
  let register = require("../../controllers/registerController");
  let jwt = require("../../utils/jwtToken")


  app.route(`/wsTravels/Users/wsSignUp`).post(register.registerNewUser);
};



