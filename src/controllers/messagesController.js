"use strict";
const db = require("../config/db");

exports.getMessagesByIdAndFriendId = async (req, res) => {
  if ("userId" in req.query) {
    const query = ` select * from messages where sendFrom in(${req.query.userId},${req.query.friendId}) and sendTo in (${req.query.userId},${req.query.friendId}) order by date asc`;
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
exports.sendMessageById = async (req, res) => {
  if (
    "userId" in req.body &&
    "message" in req.body &&
    "recipientId" in req.body &&
    req.body.message?.trim().length > 0
  ) {
    const query = ` insert into messages (message, sendTo, sendFrom) values('${req.body.message}',${req.body.userId},${req.body.recipientId});`;
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
