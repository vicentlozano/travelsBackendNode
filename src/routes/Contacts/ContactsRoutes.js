"use strict";
module.exports = function (app) {
  let contacts = require("../../controllers/contactsController");
  let jwt = require("../../utils/jwtToken");

  app
    .route(`/wsTravels/Contacts/wsGetContactsById`)
    .get(jwt.isValidToken, contacts.getContactsById);
  app
    .route(`/wsTravels/Contacts/wsDeleteContactById`)
    .post(jwt.isValidToken, contacts.deleteContactById);
    app
    .route(`/wsTravels/Contacts/wsSetRequestById`)
    .post(jwt.isValidToken, contacts.setRequestById);
     app
    .route(`/wsTravels/Contacts/wsSendRequestById`)
    .post(jwt.isValidToken, contacts.sendRequestById);
   
  app
    .route(`/wsTravels/Contacts/wsGetRequestsById`)
    .get(jwt.isValidToken, contacts.getRequestsById);
    app
    .route(`/wsTravels/Contacts/wsGetFiveContactsById`)
    .get(jwt.isValidToken, contacts.getFiveContatcs);
};
