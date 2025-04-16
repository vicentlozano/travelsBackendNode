"use strict";
const db = require("../config/db");

exports.registerNewUser = async (req, res) => {
  if (
    req.body.hasOwnProperty("email") &&
    req.body.email.trim().length > 0 &&
    req.body.hasOwnProperty("name") &&
    req.body.name.trim().length > 0 &&
    req.body.hasOwnProperty("password") &&
    req.body.password.trim().length > 0
  ) {
    const query = ` insert into users (name,email,password) values ('${req.body.name}','${req.body.email}','${req.body.password}');`;
    db.executeQuery(query, (error, result) => {
      if (error ) {
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
