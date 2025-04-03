"use strict";
module.exports = function (app) {
  let home = require("../../controllers/homeController");
  let jwt = require("../../utils/jwtToken");

  app
    .route(`/wsTraslations/Home/wsGetUserHomeFilters`)
    .get(jwt.isValidToken, home.getUserHomeFilters);

  app
    .route(`/wsTraslations/Home/wsGetWordsByFilters`)
    .get(jwt.isValidToken, home.getWordsByFilters);

  app.route(`/wsTraslations/Home/wsDeleteWord`).post(jwt.isValidToken, home.deleteWord);

  app.route(`/wsTraslations/Home/wsAddOrEditWord`).post(jwt.isValidToken, home.addOrEditWord);
};
