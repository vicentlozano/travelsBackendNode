const db = require("../config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
exports.isValidToken = async (req, res, next) => {
  if (req.headers["authorization"]) {
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    let decoded = null;
    try {
      decoded = await jwt.verify(token, process.env.KEY_SECRET);
      next();
    } catch (error) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "invalidToken",
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

exports.userInfoByToken = async (req, res) => {
  if (req.headers["authorization"]) {
    const authorization = req.headers["authorization"];
    const token = authorization.split(" ")[1];
    let decoded = null;
    let data = null;
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
      await db.executeQuery(query, (error, result) => {
        if (result.recordset.length > 0 && !error) {
          data = {
            idUser: result.recordset[0].ID_User,
            user: result.recordset[0].Email,
            level: result.recordset[0].AccessLevel,
          };
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
      return data;
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
