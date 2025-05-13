"use strict";
const db = require("../config/db");
const mqtt = require("../config/mqtt");

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
    const query = ` insert into messages (message, sendFrom, sendTo) values('${req.body.message}',${req.body.userId},${req.body.recipientId})
    RETURNING *;
;`;
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
        const [id1, id2] = [req.body.userId, req.body.recipientId].sort(
          (a, b) => a - b
        );
        const topic = `${id1}-${id2}`;
        mqtt.publish(`TRAVELS/UPDATES/${topic}`, JSON.stringify(result[0]));
        const queryAlert = `SELECT COUNT(*) AS unreadCount FROM messages WHERE sendTo = ${req.body.recipientId} AND viewed = 0`;
        db.executeQuery(queryAlert, (error, result2) => {
          if (error) {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "generalError",
              },
            });
          } else {
            mqtt.publish(
              `TRAVELS/ALERTS/CHAT/${req.body.recipientId}`,
              JSON.stringify({haveNewMessage: result2[0].unreadCount>0,unreadMessages: result2[0].unreadCount})
            );
            console.log(`TRAVELS/ALERTS/CHAT/${req.body.recipientId}`)
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
