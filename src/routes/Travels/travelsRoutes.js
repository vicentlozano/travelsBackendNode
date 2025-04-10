"use strict";
module.exports = function (app) {
  let travels = require("../../controllers/travelsController");
  let jwt = require("../../utils/jwtToken")

  app
    .route(`/wsTravels/Travels/wsGetAllTravels`)
    .get(jwt.isValidToken,travels.getAllTravels);
  app
    .route(`/wsTravels/Travels/wsDeleteTravelById`)
    .delete(jwt.isValidToken,travels.deleteTravelById);
    app
    .route(`/wsTravels/Travels/wsCreateTravel`)
    .post(jwt.isValidToken,travels.createTravel);

}
 