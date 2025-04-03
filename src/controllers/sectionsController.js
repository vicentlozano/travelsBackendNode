"use strict";

const db = require("../config/db");

exports.getAllSections = async (req, res) => {
  const query = `SELECT * FROM [AUTIS_TRADUCCIONES_TEST].[dbo].[Definition_Section] `;
  db.executeQuery(query, (err, results) => {
    if (err) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "generalError",
        },
      });
    } else {
      const sections = [];
      results.recordset.forEach((row) => {
        let section = sections.find(
          (s) => s.idSection === row.ID_Definition_Section
        );
        if (!section) {
          section = {
            idSection: row.ID_Definition_Section,
            description: row.Description,
          };
        }
        sections.push(section);
      });
      res.send({
        error: {
          status: false,
          code: 0,
          source: "",
        },
        data: {
          sections: sections,
        },
      });
    }
  });
};

exports.createOrEditSection = async (req, res) => {
  if (
    !req.body.hasOwnProperty("idSection") &&
    !req.body.hasOwnProperty("description")
  ) {
    res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "invalidParams",
      },
    });
  } else {
    const idSection = req.body.idSection;
    const description = req.body.description;

    if (idSection === 0) {
      const query = `INSERT INTO Definition_Section (Description)
        VALUES ('${description}')`;
      db.executeQuery(query, (err, result) => {
        if (err) {
          if (err.message.includes("duplicated")) {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "duplicatedSection",
              },
            });
          } else if (
            err.message.includes("permission") ||
            err.message.includes("acces")
          ) {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "noAccesLevel",
              },
            });
          }
        } else {
          res.send({
            error: {
              status: false,
              code: 0,
              source: "",
            },
          });
        }
      });
    } else {
      const query = `UPDATE Definition_Section 
        SET Description = '${description}'
        WHERE ID_Definition_Section = ${idSection}`;
      db.executeQuery(query, (err, result) => {
        if (err) {
          if (err.message.includes("duplicated")) {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "duplicatedSection",
              },
            });
          } else if (
            err.message.includes("permission") ||
            err.message.includes("acces")
          ) {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "noAccesLevel",
              },
            });
          }
        } else {
          res.send({
            error: {
              status: false,
              code: 0,
              source: "",
            },
          });
        }
      });
    }
  }
};

exports.deleteSection = async (req, res) => {
  if (!req.body.hasOwnProperty("idSection")) {
    return res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "invalidParams",
      },
    });
  } else {
    const idSection = req.body.idSection;
    const query = `DELETE FROM Definition_Section WHERE ID_Definition_Section = ${idSection}`;
    db.executeQuery(query, (err, result) => {
      if (err) {
        if (err.message.includes("Acces")) {
          return res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "noAccesLevel",
            },
          });
        } else if (err.message.includes("empty")) {
          return res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "generalError",
            },
          });
        }
      } else {
        res.send({
          error: {
            status: false,
            code: 0,
            source: "",
          },
        });
      }
    });
  }
};
