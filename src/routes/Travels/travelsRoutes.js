"use strict";
module.exports = function (app) {
  let travels = require("../../controllers/travelsController");

  app
    .route(`/wsTravels/Travels/wsGetAllTravels`)
    .get(travels.getAllTravels);

}
 