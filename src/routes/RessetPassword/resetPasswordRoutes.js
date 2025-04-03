"use strict";
module.exports = function (app) {
  let resetPassword = require("../../controllers/resetPasswordController");

  app
    .route(`/wsTraslations/ResetPassword/wsResetPassword`)
    .post(resetPassword.sendEmail);

  app
    .route(`/wsTraslations/ResetPassword/wsUpdateResetPassword`)
    .post(resetPassword.updatePassword);

  app
    .route(`/wsTraslations/ResetPassword/wsIsValidUrlResetPassword`)
    .post(resetPassword.isValidUrlPassword);
};
