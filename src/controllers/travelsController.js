"use strict";
const db = require("../config/db");

exports.getAllTravels = async (req, res) => {
  const query = ` select * from travels`;
  db.executeQuery(query, (error, result) => {
    if (error) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "generalError",
        },
      });
    } else {
      res.status(200).send({
        error: { status: false, code: 0, source: "" },
        data: result,
      });
    }
  });
};
