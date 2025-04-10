"use strict";
module.exports = function (app) {
  let login = require("../../controllers/loginController");

  app.route(`/wsTravels/Login/wsLogin`).post(login.login);

  app.route(`/wsTravels/Login/wsLoginToken`).post(login.loginToken);
};
