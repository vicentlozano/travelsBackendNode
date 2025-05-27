"use strict";
const db = require("../config/db");
const aws = require("../config/aws");

exports.getAllTravels = async (req, res) => {
  const query = `
    SELECT 
      t.id AS travel_id,
      t.name,
      t.price,
      t.travel_date,
      t.user_id,
      t.user_name,
      tp.id AS place_id,
      tp.place,
      tp.image
    FROM travels t
    LEFT JOIN travel_places tp ON t.id = tp.travel_id
  `;
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
      // Agrupar los resultados por travel_id
      const travelsMap = {};
      result.forEach((row) => {
        if (!travelsMap[row.travel_id]) {
          travelsMap[row.travel_id] = {
            travel_id: row.travel_id,
            name: row.name,
            price: row.price,
            travel_date: row.travel_date.includes("-")
              ? {
                  from: row.travel_date.split("-")[0],
                  to: row.travel_date.split("-")[1],
                }
              : row.travel_date,
            user_id: row.user_id,
            user_name: row.user_name,
            places: [],
          };
        }
        if (row.place_id) {
          travelsMap[row.travel_id].places.push({
            place_id: row.place_id,
            place: row.place,
            image: row.image,
          });
        }
      });
      const travels = Object.values(travelsMap);
      res.status(200).send({
        error: { status: false, code: 0, source: "" },
        data: travels,
      });
    }
  });
};
exports.getTravelById = async (req, res) => {
  if (req.query.id) {
    const query = `
    SELECT 
      t.*, 
      GROUP_CONCAT(tp.place SEPARATOR ', ') AS places
    FROM travels t
    LEFT JOIN travel_places tp ON t.id = tp.travel_id
    WHERE travel_id = ${req.query.id}
    GROUP BY t.id
  `;
    db.executeQuery(query, (error, result) => {
      if (error || result.length < 1) {
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
          data: result[0],
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
exports.deleteTravelById = async (req, res) => {
  if (req.query.id && (req.query.urls || req.query["urls[]"])) {
    let errorFlag = false;
    try {
      for (const url of req.query["urls[]"]) {
        let query = `SELECT COUNT(*) as total FROM travel_places WHERE image = '${url}'`;
        db.executeQuery(query, async (error, result) => {
          if (error) {
           errorFlag = true
          } else {
            if (Number(result[0].total) <= 1) {
              await aws.deleteFileFromS3Url(url);
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
      errorFlag = true;
    }
    if (!errorFlag) {
      const query = ` delete from travels where id = ${req.query.id}`;
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
          source: "errorDeleteAWS",
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
exports.createTravel = async (req, res) => {
  if (
    Object.hasOwn(req.body, "name") &&
    req.body.name.trim().length > 0 &&
    Object.hasOwn(req.body, "price") &&
    Object.hasOwn(req.body, "travel_date") &&
    req.body.travel_date.trim().length > 0 &&
    Object.hasOwn(req.body, "user_id") &&
    Object.hasOwn(req.body, "user_name") &&
    req.body.user_name.trim().length > 0 &&
    Object.hasOwn(req.body, "places") &&
    req.body.places.length > 0
  ) {
    let checkFlag = false;
    let uploadedUrls = null;
    try {
      const uploadPromises = req.files.map((file) => {
        return aws.uploadBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype
        );
      });

      uploadedUrls = await Promise.all(uploadPromises);
    } catch (error) {
      checkFlag = true;
      console.log(error);
    }
    if (!checkFlag) {
      let name = req.body.name;
      let price = req.body.price;
      let travel_date = req.body.travel_date;
      let user_id = req.body.user_id;
      let user_name = req.body.user_name;
      let places = JSON.parse(req.body.places);

      //before insert travel and travel_places we have to upload image's to AWS

      const queryInsertTravel = ` insert into travels (name, price,travel_date, user_id, user_name) 
    values('${name}',${price},'${travel_date}',${user_id},'${user_name}')`;
      db.executeQuery(queryInsertTravel, (error, result) => {
        if (error) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "generalError",
            },
          });
        } else {
          let idInserted = result.insertId;
          let values = "";
          places.forEach((place, index) => {
            if (index === places.length - 1) {
              values += `(${idInserted},'${place}','${uploadedUrls[index]}');`;
            } else {
              values += `(${idInserted},'${place}','${uploadedUrls[index]}'),`;
            }
          });
          let queryInsertPlaces = `insert into travel_places (travel_id,place,image) values ${values}`;
          db.executeQuery(queryInsertPlaces, (error, result) => {
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
        }
      });
    } else {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "UploadError",
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
exports.updateTravelById = async (req, res) => {
  console.log(req.body.id);

  if (req.body.id) {
    const id = req.body.id;
    const query = ` update travels  set days = 22 where id = ${id}`;
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
        source: "invalidParams",
      },
    });
  }
};
