"use strict";

const db = require("../config/db");

exports.getAllUsers = async (req, res) => {
  const query = `SELECT * FROM VIEW_RT_User_Project_Language`;
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
      const allFromUsers = [];
      results.recordset.forEach((row) => {
        let user = allFromUsers.find((u) => u.user.idUser === row.ID_User);
        if (!user) {
          user = {
            user: {
              idUser: row.ID_User,
              company: row.Company,
              email: row.Email,
              pass: row.Pass,
              accessLevel: row.AccessLevel,
            },
            projects: [],
          };
          allFromUsers.push(user);
        }
        let project = user.projects.find(
          (p) => p.project.value === row.ID_Definition_Project
        );
        if (!project) {
          project = {
            project: {
              value: row.ID_Definition_Project,
              label: row.Project,
              bool: row.BoolProject,
            },
            languages: [],
          };
          user.projects.push(project);
        }
        const existingLanguage = project.languages.find(
          (lang) => lang.value === row.ID_Definition_Language
        );
        if (!existingLanguage) {
          project.languages.push({
            value: row.ID_Definition_Language,
            label: row.Language,
            code: row.Code,
            bool: row.BoolLanguage,
          });
        }
      });
      res.send({
        error: {
          status: false,
          code: 0,
          source: "",
        },
        data: {
          users: allFromUsers,
        },
      });
    }
  });
};

exports.getProjectsLanguages = async (req, res) => {
  const query = `SELECT 
          Project AS ProjectName,           
          (SELECT
              idProject,
              idLanguage AS languageValue, 
              Language AS labelValue, 
              Code AS codeValue, 
              CAST('false' AS BIT) AS boolValue
          FROM 
              VIEW_RT_Projects_Languages
          WHERE 
              Project = p.Project FOR JSON PATH) AS ProjectProperties
          FROM 
              (SELECT DISTINCT Project FROM VIEW_RT_Projects_Languages) p
          ORDER BY Project;`;
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
      const infoProjects = results.recordset;
      let allProjects = infoProjects.map((project) => {
        const projectProperties = JSON.parse(project.ProjectProperties);
        const idProject = projectProperties[0].idProject;
        const languagesProjectProperties = projectProperties.map((prop) => ({
          value: prop.languageValue,
          label: prop.labelValue,
          code: prop.codeValue,
          bool: prop.boolValue,
        }));
        return {
          project: {
            value: idProject,
            label: project.ProjectName,
            bool: false,
          },
          languages: languagesProjectProperties,
        };
      });
      res.send({
        error: {
          status: false,
          code: 0,
          source: "",
        },
        data: {
          projects: allProjects,
        },
      });
    }
  });
};

exports.getAllUsersBasicInformation = async (req, res) => {
  const query = `SELECT ID_User, Company, Email, AccessLevel from Users`;
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
      const usersInfo = results.recordset;
      let userInfo = usersInfo.map((user) => {
        let userComponents = {
          idUser: user.ID_User,
          company: user.Company,
          email: user.Email,
          accesLevel: user.AccessLevel,
        };
        return {
          user: userComponents,
        };
      });
      res.send({
        error: {
          status: false,
          code: 0,
          source: "",
        },
        data: {
          users: userInfo,
        },
      });
    }
  });
};

exports.getSpecificUserInfo = async (req, res) => {
  if (!req.body.hasOwnProperty("idUser")) {
    res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "invalidParams",
      },
    });
  } else {
    const query = `SELECT
        ID_Definition_Project AS idProject, 
        Project AS descriptionProject, 
        (
          SELECT DISTINCT
            ID_Definition_Language AS idLanguage,
            Language AS descLanguage,
            Code AS codeLanguage
          FROM 
            VIEW_RT_User_Project_Language
          WHERE 
            ID_Definition_Project = p.ID_Definition_Project
          FOR JSON PATH
        ) AS languagesProject
        FROM 
          VIEW_RT_User_Project_Language p
        WHERE 
          ID_User = ${req.body.idUser}
        GROUP BY
          ID_Definition_Project, Project
        ORDER BY 
          ID_Definition_Project ASC;`;
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
        const userSpecificInfoAboutProjects = results.recordset.map(
          (project) => {
            const languagesProject = project.languagesProject
              ? JSON.parse(project.languagesProject)
              : [];
            const active = languagesProject.length > 0;
            return {
              idProject: project.idProject,
              descriptionProject: project.descriptionProject,
              languagesProject: languagesProject.map((lang) => ({
                idLanguage: lang.idLanguage,
                descriptionLanguage: lang.descLanguage,
                code: lang.codeLanguage,
                activeLanguage: lang.activeLanguage,
              })),
              active: active,
            };
          }
        );
        res.send({
          error: {
            status: false,
            code: 0,
            source: "",
          },
          data: userSpecificInfoAboutProjects,
        });
      }
    });
  }
};

exports.getLanguagesFromProject = async (req, res) => {
  if (!req.body.hasOwnProperty("idProject")) {
    res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "invalidParams",
      },
    });
  } else {
    const query = `SELECT DISTINCT ID_Definition_Language, Language, Code FROM VIEW_RT_Project_Language WHERE ID_Definition_Project = ${req.body.idProject}`;
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
        const formattedResults = results.recordset.map((language) => ({
          idLanguage: language.ID_Definition_Language,
          descriptionLanguage: language.Language,
          code: language.Code,
        }));
        res.send({
          error: {
            status: false,
            code: 0,
            source: "",
          },
          data: formattedResults,
        });
      }
    });
  }
};

exports.createOrEditUser = async (req, res) => {
  const { idUser, company, email, pass, accessLevel } = req.body;
  if (idUser === 0) {
    const userProjects = req.body.projects;
    const queryInsertUser = `INSERT INTO Users ([Company],[Email], [Pass], [AccessLevel])
        VALUES ('${company}', '${email}', '${pass}', '${accessLevel}')`;
    db.executeQuery(queryInsertUser, (err, results) => {
      if (err) {
        if (err.message.includes("duplicate")) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "duplicatedEmail",
            },
          });
        } else {
          res.status(500).send({
            error: {
              status: false,
              code: 54321,
              source: "generalError",
            },
          });
        }
      } else {
        let insertProjectsPromises = [];
        const queryGetUserId = `SELECT ID_User 
          FROM Users WHERE Email = '${email}'`;
        db.executeQuery(queryGetUserId, (err, results) => {
          if (err) {
            return res.status(500).send({
              error: {
                status: false,
                code: 54321,
                source: "errorGettingUserId",
              },
            });
          } else {
            const userId = results.recordset[0].ID_User;
            insertProjectsPromises = userProjects.map((project) => {
              const queryInserProject = `INSERT INTO RT_User_Project_Language ([ID_User], [ID_Definition_Project], [ID_Definition_Language])
              VALUES
                (${userId}, ${project.idProject}, ${project.idLanguage})`;
              return new Promise((resolve, reject) => {
                db.executeQuery(queryInserProject, (err, results) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                  }
                });
              });
            });
            Promise.all(insertProjectsPromises)
              .then(() => {
                return res.send({
                  status: false,
                  code: 0,
                  source: "",
                });
              })
              .catch((err) => {
                return res.status(500).send({
                  error: {
                    status: false,
                    code: 500,
                    source: "errorInsertingProjects",
                  },
                });
              });
          }
        });
      }
    });
  } else {
    const query = `
    IF EXISTS (SELECT 1 FROM Users WHERE Email = '${email}')
    BEGIN
        RAISERROR('duplicated email', 16, 1);
    END
    ELSE
      IF ${accessLevel} = 0
        BEGIN
          RAISERROR('permission acces', 16, 1);
        END
      ELSE 
        BEGIN
          UPDATE Users
          SET Company = '${company}', 
              Email = '${email}', 
              Pass = '${pass}', 
              AccessLevel = ${accessLevel}
          WHERE ID_User = ${idUser};
        END`;
    db.executeQuery(query, (err, result) => {
      if (err) {
        if (
          err.message.includes("duplicated") ||
          err.message.includes("email")
        ) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "duplicatedEmail",
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
};

exports.deleteUser = async (req, res) => {
  const idUser = req.body.idUser;
  const query = `DELETE FROM Users where ID_User = ${idUser};`;
  db.executeQuery(query, (err, result) => {
    if (err) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "generalError",
        },
      });
    } else {
      res.send({
        error: { status: false, code: 0, source: "" },
      });
    }
  });
};
