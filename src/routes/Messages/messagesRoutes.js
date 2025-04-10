"use strict";
module.exports = function (app) {
  let messages = require("../../controllers/messagesController");
  let jwt = require("../../utils/jwtToken");

  app
    .route(`/wsTravels/Messages/wsGetMessages`)
    .get(jwt.isValidToken, messages.getMessagesById);
};
