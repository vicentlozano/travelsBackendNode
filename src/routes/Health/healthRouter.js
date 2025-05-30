"use strict";

module.exports = function (app) {
  let health = require("../../controllers/healthController");

  app.route(`/health`).get(health.checkHealth);
};
