"use strict";
const db = require("../config/db");
const aws = require("../config/aws");
const mail = require("../config/mailService");
const fs = require("fs");

exports.registerNewUser = async (req, res) => {
  if (
    Object.hasOwn(req.body, "email") &&
    req.body.email.trim().length > 0 &&
    Object.hasOwn(req.body, "name") &&
    req.body.name.trim().length > 0 &&
    Object.hasOwn(req.body, "lastName") &&
    req.body.lastName.trim().length > 0 &&
    Object.hasOwn(req.body, "password") &&
    req.body.password.trim().length > 0 &&
    Object.hasOwn(req.body, "gender") &&
    req.body.gender.trim().length > 0
  ) {
    const file = req.file;

    if (file) {
      try {
        // multer te da req.file

        const s3Url = await aws.uploadBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        console.log("Imagen subida:", s3Url);
      } catch (error) {
        console.error(error);
      }
    }
    const payload = { check: true };
    const token = jwt.sign(payload, process.env.KEY_SECRET, {
      expiresIn: 604800,
      audience: req.body.email,
    });
    const query = ` insert into users (name,email,password,lastName,gender,avatar,register_token) values ('${req.body.name}','${req.body.email}','${req.body.password}','${req.body.lastName}','${req.body.gender}','${req.body.avatar}','${token}' );`;
    db.executeQuery(query, async (error, result) => {
      if (error) {
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: error.message.includes("Duplicate key")
              ? "This email is already registered"
              : "generalError",
          },
        });
      } else {
        let html = await fs.readFileSync(
          __dirname + `/../utils/templateVerifyEmail.txt`,
          "utf8"
        );
        html = html.replace(/\$resetToken/g, token);
        html = html.replace(/\$userName/g, req.body.email.split("@")[0]);
        html = html.replace(
          /\$clientUrl/g,
          "http://localhost:9000/#/verifyEmail"
        );

        mail.sendMail(req.body.email, "Verify email user Travel's App", html);
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
exports.verifyEmail = async (req, res) => {
  if (Object.hasOwn(req.body, "token") && req.body.token.trim().length > 0) {
    let decoded = null;
    try {
      decoded = await jwt.verify(req.body.token, process.env.KEY_SECRET);
    } catch (error) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: error.message,
        },
      });
    }
    if (decoded) {
      const userEmail = decoded.aud;
      const query = `select * from Users where email = '${userEmail}'`;
      await db.executeQuery(query, async (error, result) => {
        if (error) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "wrongCredentials",
            },
          });
        } else {
          
          if (req.body.token === result[0].register_token) {
          
            const queryActiveUser = `update Users set register_token = '', verified = 1 where email = '${userEmail}'`;
            await db.executeQuery(queryActiveUser, async (error, result) => {
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
                source: "invalidToken",
              },
            });
          }
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
