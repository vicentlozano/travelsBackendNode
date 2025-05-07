"use strict";
module.exports = function (app) {
  let contacts = require("../../controllers/contactsController");
  let jwt = require("../../utils/jwtToken");

  app
    .route(`/wsTravels/Contacts/wsGetContactsById`)
    .get(jwt.isValidToken, contacts.getContactsById);
};
