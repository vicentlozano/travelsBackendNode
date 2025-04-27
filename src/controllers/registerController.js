"use strict";
const db = require("../config/db");
const aws = require("../config/aws");

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
    console.log(file);

    if (file) {
      try {
        // multer te da req.file

        const s3Url = await aws.uploadBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        // Ahora s3Url tiene la URL pública del archivo
        console.log("Imagen subida:", s3Url);

        // Aquí podrías guardar la URL en la base de datos, etc...
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario" });
      }
    }

    const query = ` insert into users (name,email,password,lastName,gender,avatar) values ('${req.body.name}','${req.body.email}','${req.body.password}','${req.body.lastName}','${req.body.gender}','${req.body.avatar}' );`;
    db.executeQuery(query, (error, result) => {
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
