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

exports.deleteContactById = async (req, res) => {
  if ("userId" in req.body && "contactId" in req.body) {
    const query = `delete from contacts where user_id in (${req.body.userId},${req.body.contactId}) and friend_id in( ${req.body.contactId},${req.body.userId})
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
exports.getRequestsById = async (req, res) => {
  if ("userId" in req.query) {
    const query = `
SELECT u.*
FROM users u
JOIN contacts c ON u.id = c.user_id
WHERE c.friend_id = ${req.query.userId}
  AND c.pending = 1
ORDER BY c.id ASC;
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
exports.setRequestById = async (req, res) => {
  if ("userId" in req.body && "contactId" in req.body && "status" in req.body) {
    let query = "";
    if (req.body.status) {
      query = `update contacts set pending = 0 where user_id = ${req.body.contactId} and friend_id = ${req.body.userId}
`;
    } else {
      query = `delete from contacts  where user_id = ${req.body.contactId} and friend_id = ${req.body.userId}
`;
    }

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
exports.sendRequestById = async (req, res) => {
  if ("userId" in req.body && "contactId" in req.body) {
    const query = `insert into contacts(user_id, friend_id) values(${req.body.userId},${req.body.contactId});
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
exports.getFiveContatcs = async (req, res) => {
  if ("userId" in req.query) {
    let excludeIds = [];
    const excludeParam = req.query.excludeIds || req.query["excludeIds[]"];

    if (excludeParam) {
      if (Array.isArray(excludeParam)) {
        excludeIds = excludeParam
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (typeof excludeParam === "string") {
        excludeIds = excludeParam
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      }
    }
    let excludeClause = "";
    if (excludeIds.length > 0) {
      excludeClause = `AND u.id NOT IN (${excludeIds.join(",")})`;
    }

    let query = "";
    if ("lastContacts" in req.query) {
      // ...tu lógica para lastContacts...
    } else {
      query = `
SELECT u.*
FROM users u
WHERE u.id != ${req.query.userId}
  AND u.id NOT IN (
    SELECT 
      CASE 
        WHEN c.user_id = ${req.query.userId} THEN c.friend_id
        ELSE c.user_id
      END
    FROM contacts c
    WHERE (c.user_id = ${req.query.userId} OR c.friend_id = ${req.query.userId})
  )
  ${excludeClause}
LIMIT 5;
`;
    }

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
