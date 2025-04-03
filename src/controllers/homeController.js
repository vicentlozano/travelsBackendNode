"use strict";
const db = require("../config/db");
const jwt = require("../utils/jwtToken");
const moment = require("moment");

exports.getUserHomeFilters = async (req, res) => {
  const data = await jwt.userInfoByToken(req, res);
  //if data? else error?
  let userProjectsAndSections = null;
  let userLanguages = null;
  let errorCheck = false;
  if (data.level === 1) {
    const query = `SELECT DISTINCT
    v.ID_Definition_Project,
    v.desProj, as Description_Project
    v.ID_Definition_Section,
    v.desSection AS   Description_Section,
    CAST(ROUND(CAST(COALESCE(t.Traducidas, 0) AS DECIMAL) / NULLIF(t.Total, 0) * 100, 2) AS INT) AS PorcentajeTraducido
FROM 
    VIEW_Projects_By_User v
LEFT JOIN (
    SELECT 
        T.ID_Definition_Projects,
        COUNT(T.[Key]) AS Total,
        SUM(CASE WHEN T.[Value] IS NOT NULL OR T.[Value] = '' THEN 1 ELSE 0 END) AS Traducidas
    FROM 
        Translations T
    INNER JOIN RT_User_Project_Language UP ON T.ID_Definition_Projects = UP.ID_Definition_Project
    WHERE 
        UP.ID_User = ${data.idUser} 
        AND T.ID_Definition_Language = UP.ID_Definition_Language 
    GROUP BY 
        T.ID_Definition_Projects
) t ON v.ID_Definition_Project = t.ID_Definition_Projects AND v.ID_User = ${data.idUser} 
WHERE 
    v.ID_User = ${data.idUser}
ORDER BY
    v.desProj ASC;`;
    await db.executeQuery(query, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        userProjectsAndSections = result.recordset;
      }
    });

    const query2 = `SELECT 
    VAP.Project,
    VAP.ID_Definition_Language,
    VAP.Language,
    VAP.Code,
    VAP.ID_User,
    UP.ID_Definition_Project,
    CAST(ROUND(CAST(SUM(CASE WHEN T.[Value] IS NOT NULL OR T.[Value] = '' THEN 1 ELSE 0 END) AS DECIMAL) / NULLIF(COUNT(T.[Key]), 0) * 100, 2) AS INT) AS PorcentajeTraducido
FROM
    VIEW_RT_User_Project_Language VAP
    INNER JOIN RT_User_Project_Language UP ON VAP.ID_Definition_Project = UP.ID_Definition_Project
    LEFT JOIN Translations T ON VAP.ID_Definition_Project = T.ID_Definition_Projects AND VAP.ID_Definition_Language = T.ID_Definition_Language
WHERE
    VAP.ID_User = ${data.idUser}
GROUP BY
    VAP.Project,
    VAP.ID_Definition_Language,
    VAP.Language as Description_Language,
    VAP.Code,
    VAP.ID_User,
    UP.ID_Definition_Project
ORDER BY
    CASE WHEN VAP.ID_Definition_Language = 1 THEN 0 ELSE 1 END,
    VAP.Project ASC,
	PorcentajeTraducido DESC,
    VAP.Language ASC;`;
    await db.executeQuery(query2, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        userLanguages = result.recordset;
      }
    });
  } else if (data.level === 100) {
    const query = `SELECT
    VAP.ID_Definition_Project,
    VAP.Description_Project,
    VAP.ID_Definition_Section,
    VAP.Description_Section,
    CAST(ROUND(CAST(SUM(CASE WHEN T.[Value] IS NOT NULL OR T.[Value] = '' THEN 1 ELSE 0 END) AS DECIMAL) / NULLIF(COUNT(T.[Key]), 0) * 100, 2) AS INT) AS PorcentajeTraducido
FROM 
    View_All_Projects VAP
LEFT JOIN Translations T ON VAP.ID_Definition_Project = T.ID_Definition_Projects
GROUP BY
    VAP.ID_Definition_Project,
    VAP.Description_Project,
    VAP.ID_Definition_Section,
    VAP.Description_Section
ORDER BY 
    VAP.Description_Project ASC,
    VAP.Description_Section ASC`;
    await db.executeQuery(query, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        userProjectsAndSections = result.recordset;
      }
    });

    const query2 = `SELECT
    VAP.ID_Definition_Project,
    VAP.Description_Project,
    VAP.ID_Definition_Language,
    VAP.Description_Language,
    VAP.Code,
    CAST(ROUND(CAST(SUM(CASE WHEN T.[Value] IS NOT NULL OR T.[Value] = '' THEN 1 ELSE 0 END) AS DECIMAL) / NULLIF(COUNT(T.[Key]), 0) * 100, 2) AS INT) AS PorcentajeTraducido
FROM 
    View_All_Projects VAP
LEFT JOIN Translations T ON VAP.ID_Definition_Project = T.ID_Definition_Projects AND VAP.ID_Definition_Language = T.ID_Definition_Language
GROUP BY
    VAP.ID_Definition_Project,
    VAP.Description_Project,
    VAP.ID_Definition_Language,
    VAP.Description_Language,
    VAP.Code
ORDER BY 
    CASE WHEN VAP.ID_Definition_Language = 1 THEN 0 ELSE 1 END,
    VAP.Description_Project ASC,
	PorcentajeTraducido DESC,
    VAP.Description_Language;`;
    await db.executeQuery(query2, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        userLanguages = result.recordset;
      }
    });
  }
  if (!errorCheck) {
    let finalData = [];
    for (let i = 0; i < userProjectsAndSections.length; i++) {
      let project = {
        project: {
          value: userProjectsAndSections[i].ID_Definition_Project,
          label: userProjectsAndSections[i].Description_Project,
          bool: false,
          percentageProject: `${userProjectsAndSections[i].PorcentajeTraducido} %`,
        },
        languages: [],
        sections: [],
      };
      if (finalData.length === 0) {
        finalData.push(project);
      } else if (
        !finalData.find(
          (project) =>
            project.project.value ===
            userProjectsAndSections[i].ID_Definition_Project
        )
      ) {
        finalData.push(project);
      }
    }
    for (let i = 0; i < userProjectsAndSections.length; i++) {
      for (let j = 0; j < finalData.length; j++) {
        if (
          userProjectsAndSections[i].ID_Definition_Project ===
            finalData[j].project.value &&
          !finalData[j].sections.find(
            (section) =>
              section.value === userProjectsAndSections[i].ID_Definition_Section
          )
        ) {
          finalData[j].sections.push({
            value: userProjectsAndSections[i].ID_Definition_Section,
            label: userProjectsAndSections[i].Description_Section,
            bool: false,
          });
        }
      }
    }

    for (let i = 0; i < userLanguages.length; i++) {
      for (let j = 0; j < finalData.length; j++) {
        if (
          userLanguages[i].ID_Definition_Project ===
            finalData[j].project.value &&
          !finalData[j].languages.find(
            (language) =>
              language.value === userLanguages[i].ID_Definition_Language
          )
        ) {
          finalData[j].languages.push({
            value: userLanguages[i].ID_Definition_Language,
            label: userLanguages[i].Description_Language,
            code: userLanguages[i].Code,
            bool: false,
            percentatgeLanguage: `${userLanguages[i].PorcentajeTraducido} %`,
          });
        }
      }
    }

    res.status(200).send({
      error: { status: false, code: 0, source: "" },
      data: finalData,
    });
  } else {
    res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "generalError",
      },
    });
  }
};

exports.getWordsByFilters = async (req, res) => {
  if (
    req.query.hasOwnProperty("sections") &&
    req.query.hasOwnProperty("idLanguage") &&
    req.query.hasOwnProperty("idProject")
  ) {
    const sections = req.query.sections;
    const idLanguage = req.query.idLanguage;
    const idProject = req.query.idProject;
    let errorCheck = false;
    let arrayOfWords = [];
    let arrayOfTranslations = [];
    let wordInEnglish = [];
    const arrayTrad = [];

    let query = "";
    let query2 = "";
    let query3 = "";
    if (sections == 0) {
      query = `select * from Translations where  ID_Definition_Language = ${idLanguage}  and ID_Definition_Projects = ${idProject}  `;
      query2 = `SELECT [Key], [Value], Description FROM VIEW_Project_Languages
    WHERE ID_Definition_Language = ${idLanguage} AND ID_Definition_Project != ${idProject} `;
      query3 = `select [Key],[Value]  from Translations where  ID_Definition_Language = 1  and ID_Definition_Projects = ${idProject}  `;
    } else {
      query = `select * from Translations where Sections = ${sections} and ID_Definition_Language = ${idLanguage}  and ID_Definition_Projects = ${idProject}  `;
      query2 = `SELECT [Key], [Value], Description FROM VIEW_Project_Languages
    WHERE ID_Definition_Language = ${idLanguage} AND ID_Definition_Project != ${idProject}`;
      query3 = `select [Key],[Value]  from Translations where Sections = ${sections} and ID_Definition_Language = 1  and ID_Definition_Projects = ${idProject}  `;
    }

    await db.executeQuery(query, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        arrayOfWords = result.recordset;
      }
    });
    await db.executeQuery(query2, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        arrayOfTranslations = result.recordset;
      }
    });
    await db.executeQuery(query3, (error, result) => {
      if (error) {
        errorCheck = true;
      } else {
        wordInEnglish = result.recordset;
      }
    });
    if (
      errorCheck ||
      arrayOfWords.length === 0 ||
      arrayOfTranslations.length === 0 ||
      wordInEnglish.length === 0
    ) {
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "generalError",
        },
      });
    } else {
      let countWords = 0;
      let translationsCount = 0;
      for (let i = 0; i < arrayOfWords.length; i++) {
        let tipsWord = [];
        let countTips = 0;
        arrayOfTranslations.find((word) => {
          if (word.Key === arrayOfWords[i].Key && countTips < 5) {
            let addOrNot = tipsWord.filter(
              (wordValue) => wordValue === word.Value
            );
            if (addOrNot.length < 1) {
              tipsWord.push({
                word: word.Value,
                projectLabel: word.Description,
              });
              countTips++;
            }
          }
        });
        let transEnglish = wordInEnglish.find(
          (word) => word.Key === arrayOfWords[i].Key
        );
        let word = {
          idTrans: arrayOfWords[i].ID_Translations,
          key: arrayOfWords[i].Key,
          tips: tipsWord,
          value: arrayOfWords[i].Value ? arrayOfWords[i].Value : "",
          transEnglish: transEnglish.Value,
          wordSection: Number(arrayOfWords[i].Sections),
          wordDescription: arrayOfWords[i].WordDescription || "",
        };
        arrayTrad.push(word);
        countWords++;
        if (word.value !== "") {
          translationsCount++;
        }
      }
      let wordCount = countWords;

      res.status(200).send({
        error: { status: false, code: 0, source: "" },
        data: arrayTrad,
        translationsCount,
        wordCount,
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

exports.deleteWord = async (req, res) => {
  if (req.body.hasOwnProperty("key") && req.body.hasOwnProperty("idProject")) {
    let sections = req.body.hasOwnProperty("idSection")
      ? req.body.hasOwnProperty("idSection")
      : null;

    let query = "";
    query = sections
      ? `delete from  Translations where [Key] = '${req.body.key}' and ID_Definition_Projects = ${req.body.idProject} and Sections = ${req.body.idSection}`
      : `delete from  Translations where [Key] = '${req.body.key}' and ID_Definition_Projects = ${req.body.idProject}`;
    db.executeQuery(query, (error, result) => {
      if (error || result.rowsAffected[0] === 0) {
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

exports.addOrEditWord = async (req, res) => {
  if (
    req.body.hasOwnProperty("idTranslations") &&
    req.body.hasOwnProperty("key") &&
    req.body.key.trim().length > 0 &&
    req.body.hasOwnProperty("idProject") &&
    req.body.hasOwnProperty("email") &&
    req.body.hasOwnProperty("words") &&
    req.body.words.length > 0
  ) {
    let errorCheck = false;
    if (req.body.idTranslations === 0) {
      let query = "";
      let duplicate = false;
      for (let i = 0; i < req.body.words.length; i++) {
        // control single quotations on word value; scape caracter ' on sql = ''
        req.body.words[i].value = req.body.words[i].value.replace(/'/g, "''");
        query = `insert into Translations([Key],Value,ID_Definition_Language,Sections,ID_Definition_Projects,LastUserModification,LastDateModification) values (N'${
          req.body.key
        }', N'${req.body.words[i].value}', ${req.body.words[i].idLanguage},${
          req.body.idSection
        },${req.body.idProject},'${req.body.email}','${moment().format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )}')`;
        await db.executeQuery(query, (error, result) => {
          if (error || result.rowsAffected[0] === 0) {
            duplicate = error.message.includes("duplicate");
            errorCheck = true;
          }
        });
        if (errorCheck) {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: duplicate ? "duplicatedKey" : "generalError",
            },
          });
          return;
        }
      }
      if (!errorCheck) {
        res.status(200).send({
          error: { status: false, code: 0, source: "" },
          query: query,
        });
      }
    } else {
      let checkingKey = await checkUpdateKey(
        req.body.idTranslations,
        req.body.key,
        req.body.email,
        req.body.idProject,
        req.body.idSection ? req.body.idSection : null
      );
      if (checkingKey) {
        let sections = req.body.idSection ? req.body.idSection : null;
        let query = "";
        if (sections) {
          query = `update Translations set LastUserModification = '${
            req.body.email
          }', Value = N'${
            req.body.words[0].value
          }', LastDateModification = '${moment().format(
            "YYYY-MM-DD HH:mm:ss.SSS"
          )}' where ID_Translations = ${
            req.body.idTranslations
          } and ID_Definition_Projects = ${req.body.idProject} and Sections = ${
            req.body.idSection
          } and ID_Definition_Language = ${req.body.words[0].idLanguage}`;
        } else {
          query = `update Translations set LastUserModification = '${
            req.body.email
          }', Value = N'${
            req.body.words[0].value
          }', LastDateModification = '${moment().format(
            "YYYY-MM-DD HH:mm:ss.SSS"
          )}' where ID_Translations = ${
            req.body.idTranslations
          } and ID_Definition_Projects = ${
            req.body.idProject
          }  and ID_Definition_Language = ${req.body.words[0].idLanguage}`;
        }

        await db.executeQuery(query, (error, result) => {
          if (error || result.rowsAffected[0] === 0) {
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
        es.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "invalidParams",
          },
        });
      }
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

const checkUpdateKey = async (
  idTranslations,
  key,
  email,
  idProject,
  idSection
) => {
  return new Promise((resolve) => {
    let newKey = false;
    let queryNewKey = `select [key] from Translations where ID_Translations = ${idTranslations} and [Key] = '${key}'`;
    db.executeQuery(queryNewKey, (error, result) => {
      if (error) {
        resolve(false);
      } else {
        newKey = result.rowsAffected[0] === 0 ? true : false;
        if (newKey) {
          let queryOldKey = `select [Key] from Translations where ID_Translations = ${idTranslations}`;
          let oldKey = "";
          db.executeQuery(queryOldKey, (error, result) => {
            if (error || result.rowsAffected[0] === 0) {
              resolve(false);
            } else {
              oldKey = result.recordset[0].Key;
              let queryUpdate = "";
              if (idSection) {
                queryUpdate = `update Translations set [key] = N'${key}', LastUserModification = '${email}' , LastDateModification = '${moment().format(
                  "YYYY-MM-DD HH:mm:ss.SSS"
                )}' where [Key] = '${oldKey}' and ID_Definition_Projects = ${idProject} and Sections = ${idSection} `;
              } else {
                queryUpdate = `update Translations set [key] = N'${key}', LastUserModification = '${email}' , LastDateModification = '${moment().format(
                  "YYYY-MM-DD HH:mm:ss.SSS"
                )}' where [Key] = '${oldKey}' and ID_Definition_Projects = ${idProject}`;
              }

              db.executeQuery(queryUpdate, (error, result) => {
                if (error || result.rowsAffected[0] === 0) {
                  resolve(false);
                } else {
                  resolve(true);
                }
              });
            }
          });
        } else {
          resolve(true);
        }
      }
    });
  });
};
