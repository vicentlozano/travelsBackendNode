"use strict";
const db = require("../config/db");

exports.isValidUrlCode = async (req, res) => {
  if (req.query.hasOwnProperty("code")) {
    const query = `select * from Users where RegisterCode = '${req.query.code}'`;
    db.executeQuery(query, (error, result) => {
      if (result.recordset.length > 0) {
        res.status(200).send({
          error: {
            status: false,
            code: 0,
            source: "",
          },
        });
      } else {
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "generalError",
          },
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

exports.registerNewUser = async (req, res) => {
  if (
    req.body.hasOwnProperty("email") &&
    req.body.email.trim().length > 0 &&
    req.body.hasOwnProperty("company") &&
    req.body.company.trim().length > 0 &&
    req.body.hasOwnProperty("password") &&
    req.body.password.trim().length > 0 &&
    req.body.hasOwnProperty("code") &&
    req.body.code.trim().length > 0
  ) {
    const query = ` update Users set Email = '${req.body.email}', Company = '${req.body.company}', Pass = '${req.body.password}', RegisterCode = null where RegisterCode = '${req.body.code}'`;
    db.executeQuery(query, (error, result) => {
      if (error || result.rowsAffected[0] === 0) {
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
