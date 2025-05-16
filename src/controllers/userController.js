"use strict";
const db = require("../config/db");
const aws = require("../config/aws");

exports.changeAvatar = async (req, res) => {
  if (req.body.userId && req.file) {
    let errorFlag = false;
    const file = req.file;
    let s3Url = "";

    if (file) {
      try {
        // multer te da req.file
        s3Url = await aws.uploadBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        console.log("Imagen subida:", s3Url);
      } catch (error) {
        console.error(error);
        errorFlag = true;
      }
    }

    if (!errorFlag) {
      const query = `update users set avatar = '${s3Url}' where id = ${req.body.userId}`;
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
            newAvatar: s3Url,
          });
        }
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
exports.changeName = async (req, res) => {
  if (req.body.userId && req.body.username) {
    const query = `update users set name = '${req.body.username}' where id = ${req.body.userId}`;
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
        });
      }
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
};
exports.resetPassword = async (req, res) => {
  if (req.body.userId && req.body.oldPassword && req.body.newPassword) {
    console.log(req.body.oldPassword, req.body.newPassword);
    const querySecurity = `select password from users where id = ${req.body.userId}`;
    db.executeQuery(querySecurity, (error, result) => {
      if (error) {
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "generalError",
          },
        });
      } else {
        if (req.body.oldPassword === result[0].password) {
          const query = `update users set password = '${req.body.newPassword}' where id = ${req.body.userId}`;
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
              });
            }
          });
        } else {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "The password is incorrect",
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
        source: "generalError",
      },
    });
  }
};
