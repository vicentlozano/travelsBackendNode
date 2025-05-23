"use strict";
const multer = require("multer");

// Usamos multer sin configuración especial: almacena en memoria

const upload = multer({ storage: multer.memoryStorage() });
module.exports = function (app) {
  let user = require("../../controllers/userController");
  let jwt = require("../../utils/jwtToken");

  app
    .route(`/wsTravels/User/wsChangeAvatar`)
    .post(upload.single("avatar"), jwt.isValidToken, user.changeAvatar);
  app
    .route(`/wsTravels/User/wsChangeName`)
    .post(jwt.isValidToken, user.changeName);
      app
    .route(`/wsTravels/User/wsResetPassword`)
    .post(jwt.isValidToken, user.resetPassword);
};
