"use strict";
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function (app) {
  let travels = require("../../controllers/travelsController");
  let jwt = require("../../utils/jwtToken");

  app
    .route(`/wsTravels/Travels/wsGetAllTravels`)
    .get(jwt.isValidToken, travels.getAllTravels);
  app
    .route(`/wsTravels/Travels/wsDeleteTravelById`)
    .delete(jwt.isValidToken, travels.deleteTravelById);
  app
    .route(`/wsTravels/Travels/wsCreateTravel`)
    .post(jwt.isValidToken, upload.array('images', 5), travels.createTravel);
  app
    .route(`/wsTravels/Travels/wsUpdateTravelById`)
    .post(jwt.isValidToken, travels.updateTravelById);
  app
    .route(`/wsTravels/Travels/wsGetTravelById`)
    .get(jwt.isValidToken, travels.getTravelById);
};
