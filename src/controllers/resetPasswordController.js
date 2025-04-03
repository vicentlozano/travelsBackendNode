"use strict";
const { query } = require("mssql");
const db = require("../config/db");
const { sendMail } = require("../config/mailService");
const fs = require("fs");
const md5 = require("md5");
const moment = require("moment");

exports.sendEmail = async (req, res) => {
  if (req.body.hasOwnProperty("email")) {
    let html = await fs.readFileSync(
      __dirname + `/../utils/templateResetPassword.txt`,
      "utf8"
    );
    let token = md5(Date.now().toString() + "AutisTranslations2025Backend");
    html = html.replace(/\$resetToken/g, token);
    html = html.replace(/\$userName/g, req.body.email.split("@")[0]);
    html = html.replace(/\$clientUrl/g, "https://translations.autis.es");

    const query = `update Users set RecoveryToken = '${token}', DateTokenCreated = '${moment().format(
      "YYYY-MM-DD HH:mm:ss.SSS"
    )}'  where Email = '${req.body.email}'`;
    db.executeQuery(query, (error, result) => {
      if (error) {
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "failedToInsert",
          },
        });
      } else {
        if (result.rowsAffected[0] === 0) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "userDontExist",
            },
          });
        } else {
          sendMail(req.body.email, "Reset Password Autis", html);
          res.status(200).send({
            error: { status: false, code: 0, source: "" },
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

exports.updatePassword = async (req, res) => {
  if (
    req.body.hasOwnProperty("urlToken") &&
    req.body.hasOwnProperty("password")
  ) {
    const query = `update Users set Pass = '${req.body.password}', RecoveryToken = null, DateTokenCreated = null  where RecoveryToken = '${req.body.urlToken}'`;
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
        if (result.rowsAffected[0] === 0) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "invalidToken",
            },
          });
        } else {
          res.status(200).send({
            error: { status: false, code: 0, source: "" },
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

exports.isValidUrlPassword = async (req, res) => {
  if (req.body.hasOwnProperty("urlToken")) {
    const query = `select * from Users where RecoveryToken = '${req.body.urlToken}'`;
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
        if (result.rowsAffected[0] === 0) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "invalidToken",
            },
          });
        } else {
          let dateToken = result.recordset[0].DateTokenCreated;
          let difference = moment(
            moment().format("YYYY-MM-DD HH:mm:ss.SSS")
          ).diff(
            moment(dateToken).utc().format("YYYY-MM-DD HH:mm:ss.SSS"),
            "second"
          );
          if (difference < 7200) {
            res.status(200).send({
              error: { status: false, code: 0, source: "" },
            });
          } else {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "invalidToken",
              },
            });
          }
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
