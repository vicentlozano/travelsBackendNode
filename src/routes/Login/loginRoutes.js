"use strict";
module.exports = function (app) {
  let login = require("../../controllers/loginController");

  app.route(`/wsTraslations/Login/wsLogin`).post(login.login);

  app.route(`/wsTraslations/Login/wsLoginToken`).post(login.loginToken);
};
