"use strict";
const multer = require("multer");

// Usamos multer sin configuración especial: almacena en memoria
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function (app) {
  const register = require("../../controllers/registerController");

  app
    .route(`/wsTravels/Users/wsSignUp`)
    .post(upload.single('avatar'), register.registerNewUser);
    app
    .route(`/wsTravels/Users/wsVerifyEmail`)
    .post(register.verifyEmail);
};