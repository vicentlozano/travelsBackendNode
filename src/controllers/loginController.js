"use strict";
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.login = async (req, res) => {
  if (req.body.hasOwnProperty("user") && req.body.hasOwnProperty("hash")) {
    const query = `select * from Users where Email = '${req.body.user}' and Pass = '${req.body.hash}'`;
    db.executeQuery(query, (error, result) => {
      if (error || result.recordset.length < 1) {
        res.status(200).send({
          error: {
            status: true,
            code: 54321,
            source: "wrongCredentials",
          },
          data: {
            token: "",
            idUser: 0,
            user: "",
            level: 0,
          },
         
        });
      } else {
        const payload = { check: true };
        const token = jwt.sign(payload, process.env.KEY_SECRET, {
          expiresIn: 43200,
          audience: result.recordset[0].ID_User.toString(),
        });
        res.status(200).send({
          error: { status: false, code: 0, source: "" },
          data: {
            token: token,
            idUser: result.recordset[0].ID_User,
            user: result.recordset[0].Email,
            level: result.recordset[0].AccessLevel,
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
exports.loginToken = async (req, res) => {
  if (req.headers["authorization"]) {
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    let decoded = null;
    try {
      decoded = await jwt.verify(token, process.env.KEY_SECRET);
    } catch (error) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "wrongCredentials",
        },
      });
    }
    if (decoded) {
      const userId = decoded.aud;
      const query = `select * from Users where ID_User = ${userId}`;
      db.executeQuery(query, (error, result) => {
        if (result.recordset.length > 0) {
          res.status(200).send({
            error: { status: false, code: 0, source: "" },
            data: {
              token: token,
              idUser: result.recordset[0].ID_User,
              user: result.recordset[0].Email,
              level: result.recordset[0].AccessLevel,
            },
          });
        } else {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "wrongCredentials",
            },
          });
        }
      });
    }
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
