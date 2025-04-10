"use strict";
const db = require("../config/db");

exports.getMessagesById = async (req, res) => {
  if ("userId" in req.query) {
    const query = ` select * from messages where sendFrom =  ${req.query.userId} or sendTo = ${req.query.userId} `;
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
  } else {
    res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "invalidParams",
      },
    });
  }
};
