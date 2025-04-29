"use strict";
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.login = async (req, res) => {
  if (req.body.hasOwnProperty("user") && req.body.hasOwnProperty("hash")) {
    const query = `select * from users where email = '${req.body.user}' and password = '${req.body.hash}'`;
    db.executeQuery(query, (error, result) => {
      if (error || result[0].length < 1) {
        res.status(500).send({
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
        console.log(result[0].verified);
        if (result[0].verified === 0) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "userNotVerified",
            },
          });
        } else {
          const payload = { check: true };
          const token = jwt.sign(payload, process.env.KEY_SECRET, {
            expiresIn: 43200,
            audience: result[0].id.toString(),
          });
          res.status(200).send({
            error: { status: false, code: 0, source: "" },
            data: {
              token: token,
              idUser: result[0].id,
              email: result[0].email,
              name: result[0].name,
              role: result[0].role,
              avatar: result[0].avatar,
            },
          });
        }
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
      const query = `select * from users where id = ${userId}`;
      db.executeQuery(query, (error, result) => {
        if (error) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "wrongCredentials",
            },
          });
        } else {
          res.status(200).send({
            error: { status: false, code: 0, source: "" },
            data: {
              token: token,
              userId: result[0].id,
              name: result[0].name,
              email: result[0].email,
              role: result[0].role,
              avatar: result[0].avatar,
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
