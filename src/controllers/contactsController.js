"use strict";
const db = require("../config/db");

exports.getContactsById = async (req, res) => {
  if ("userId" in req.query) {
    const query = ` SELECT *
FROM users u
WHERE u.id IN (
    SELECT c.friend_id
    FROM contacts c
    where user_id = ${req.query.userId}
);`;
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
