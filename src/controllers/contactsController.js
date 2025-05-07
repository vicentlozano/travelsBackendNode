"use strict";
const db = require("../config/db");

exports.getContactsById = async (req, res) => {
  if ("userId" in req.query) {
    const query = `SELECT u.*
FROM users u
JOIN contacts c ON u.id = c.friend_id
LEFT JOIN (
    SELECT 
        CASE 
            WHEN sendFrom = ${req.query.userId} THEN sendTo
            ELSE sendFrom
        END AS contact_id,
        MAX(date) AS last_message
    FROM messages
    WHERE sendFrom = ${req.query.userId} OR sendTo = ${req.query.userId}
    GROUP BY contact_id
) m ON u.id = m.contact_id
WHERE c.user_id = ${req.query.userId}
ORDER BY m.last_message IS NULL, m.last_message DESC;
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
