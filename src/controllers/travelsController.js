"use strict";
const db = require("../config/db");

exports.getAllTravels = async (req, res) => {
  const query = `
  SELECT 
    t.*, 
    GROUP_CONCAT(tp.place SEPARATOR ', ') AS places
  FROM travels t
  LEFT JOIN travel_places tp ON t.id = tp.travel_id
  GROUP BY t.id
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
      res.status(200).send({
        error: { status: false, code: 0, source: "" },
        data: result,
      });
    }
  });
};
exports.deleteTravelById = async (req, res) => {
  if (req.query.id) {
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
        source: "invalidParams",
      },
    });
  }
};
exports.createTravel = async (req, res) => {
  if (req.body.hasOwnProperty("travel")) {
    let {
      name,
      days,
      price,
      background_image,
      travel_date,
      user_id,
      user_name,
      places,
    } = req.body.travel;
    const queryInsertTravel = ` insert into travels (name, days, price, background_image, travel_date, user_id, user_name) 
    values('${name}',${days},${price},'${background_image}','${travel_date}',${user_id},'${user_name}')`;
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
            values += `(${idInserted},'${place}');`;
          } else {
            values += `(${idInserted},'${place}'),`;
          }
        });
        let queryInsertPlaces = `insert into travel_places (travel_id,place) values ${values}`;
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
        source: "invalidParams",
      },
    });
  }
};
