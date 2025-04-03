"use strict";
const db = require("../config/db");
const fs = require("fs");
const { Buffer } = require("node:buffer");
const admZip = require("adm-zip");
const path = require("path");
const { mkdir } = require("fs/promises");
const { unlink } = require("fs/promises");
const moment = require("moment");

exports.getAllProjectsLanguagesAndSections = async (req, res) => {
  let allProjectsAndSections = null;
  let allLanguages = null;
  let errorCheck = false;
  const query = `SELECT
    VAP.ID_Definition_Project,
    VAP.Description_Project,
    VAP.ID_Definition_Section,
    VAP.Description_Section

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
      allProjectsAndSections = result.recordset;
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
    VAP.Description_Language;`;

  await db.executeQuery(query2, (error, result) => {
    if (error) {
      errorCheck = true;
    } else {
      allLanguages = result.recordset;
    }
  });

  if (!errorCheck) {
    let dataTest = [];
    allProjectsAndSections.forEach((project) => {
      if (
        !dataTest.find(
          (projectSelected) =>
            projectSelected.project.value === project.ID_Definition_Project
        )
      ) {
        let newProject = {
          project: {
            value: project.ID_Definition_Project,
            label: project.Description_Project,
            bool: false,
          },
          sections: [],
          languages: [],
        };
        dataTest.push(newProject);
      }
      dataTest.forEach((projectSelected) => {
        if (projectSelected.project.value === project.ID_Definition_Project) {
          if (
            !projectSelected.sections.find(
              (section) => section.value === project.ID_Definition_Section
            )
          ) {
            projectSelected.sections.push({
              value: project.ID_Definition_Section,
              label: project.Description_Section,
              bool: true,
            });
          }
        }
      });
    });
    allLanguages.forEach((language) => {
      dataTest.forEach((projectSelected) => {
        if (
          language.ID_Definition_Project === projectSelected.project.value &&
          !projectSelected.languages.find(
            (language) =>
              language.value === projectSelected.ID_Definition_Language
          )
        ) {
          let haveTranslations =
            language.PorcentajeTraducido > 0 ? true : false;
          projectSelected.languages.push({
            value: language.ID_Definition_Language,
            label: language.Description_Language,
            code: language.Code,
            bool: true,
            haveTranslations: haveTranslations,
          });
        }
      });
    });

    res.status(200).send({
      error: { status: false, code: 0, source: "" },
      data: dataTest,
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

exports.getAllLanguagesAndSections = async (req, res) => {
  let allLanguagesAndSections = null;
  let allLanguagesCodes = null;
  let errorCheck = false;
  const query = ` select * from VIEW_All_Languages_Sections `;
  await db.executeQuery(query, (error, result) => {
    if (error) {
      errorCheck = true;
    } else {
      allLanguagesAndSections = result.recordset;
    }
  });
  const query2 = ` select * from Definition_Language `;
  await db.executeQuery(query2, (error, result) => {
    if (error) {
      errorCheck = true;
    } else {
      allLanguagesCodes = result.recordset;
    }
  });
  if (!errorCheck) {
    let data = {
      languages: [],
      sections: [],
    };
    allLanguagesAndSections.forEach((project) => {
      if (
        !data.sections.find(
          (section) => section.value === project.ID_Definition_Section
        )
      ) {
        data.sections.push({
          value: project.ID_Definition_Section,
          label: project.Expr1,
          bool: false,
        });
      }

      let code = allLanguagesCodes.find(
        (language) =>
          language.ID_Definition_Language === project.ID_Definition_Language
      );

      if (
        !data.languages.find(
          (language) => language.value === project.ID_Definition_Language
        )
      ) {
        data.languages.push({
          value: project.ID_Definition_Language,
          label: project.Language,
          code: code.Code,
          bool: false,
        });
      }
    });
    res.status(200).send({
      error: { status: false, code: 0, source: "" },
      data: data,
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

exports.exportKeysByProjectLanguage = async (req, res) => {
  //
};

exports.createOrEditProject = async (req, res) => {
  if (
    req.body.hasOwnProperty("idProject") &&
    req.body.hasOwnProperty("description") &&
    req.body.hasOwnProperty("idLanguages") &&
    req.body.hasOwnProperty("idSections")
  ) {
    let errorCheck = false;
    if (req.body.idProject === 0) {
      //new Project
      // definition projects
      const query = ` insert into  Definition_Projects(Description) values('${req.body.description}'); select @@IDENTITY as ID;`;
      await db.executeQuery(query, (error, result) => {
        if (error || result.rowsAffected[0] === 0) {
          error.message.includes("duplicate")
            ? res.status(500).send({
                error: {
                  status: true,
                  code: 54321,
                  source: "duplicatedKey",
                },
              })
            : res.status(500).send({
                error: {
                  status: true,
                  code: 54321,
                  source: "generalError",
                },
              });
        } else {
          let id = result.recordset[0].ID;
          let count = 0;
          // Project Section,
          for (let i = 0; i < req.body.idSections.length; i++) {
            const query2 = ` insert into Project_Sections(ID_Definition_Section, ID_Definition_Project) values(${req.body.idSections[i]}, ${id})`;
            db.executeQuery(query2, (error, result) => {
              if (error || result.rowsAffected[0] === 0) {
                errorCheck = true;
                return;
              } else {
                count++;
              }
            });
          }

          // RT_Project_Language
          if (!errorCheck) {
            for (let i = 0; i < req.body.idLanguages.length; i++) {
              const query3 = ` insert into RT_Project_Language(ID_Definition_Project, ID_Definition_Language) values(${id}, ${req.body.idLanguages[i]})`;
              db.executeQuery(query3, (error, result) => {
                if (error || result.rowsAffected[0] === 0) {
                  res.status(500).send({
                    error: {
                      status: true,
                      code: 54321,
                      source: "generalError",
                    },
                  });
                  return;
                } else {
                  count++;
                  if (
                    count ===
                    req.body.idLanguages.length + req.body.idSections.length
                  ) {
                    res.status(200).send({
                      error: { status: false, code: 0, source: "" },
                    });
                  }
                }
              });
            }
          } else {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "generalError",
              },
            });
          }
        }
      });
    } else if (req.body.idProject > 0) {
      // update Project
      // definition projects
      let count = 0;
      const query = ` update  Definition_Projects set Description ='${req.body.description}' where ID_Definition_Project = ${req.body.idProject}`;
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
          //delete all languages for this project first
          const deleteLanguagesQuery = `delete from RT_Project_Language where ID_Definition_Project = ${req.body.idProject}`;
          db.executeQuery(deleteLanguagesQuery, (error, result) => {
            if (error || result.rowsAffected[0] === 0) {
              errorCheck = true;
            } else {
              // RT_Project_Language
              for (let i = 0; i < req.body.idLanguages.length; i++) {
                const query3 = ` insert into RT_Project_Language(ID_Definition_Project, ID_Definition_Language) values(${req.body.idProject}, ${req.body.idLanguages[i]})`;
                db.executeQuery(query3, (error, result) => {
                  if (error || result.rowsAffected[0] === 0) {
                    errorCheck = true;
                    return;
                  } else {
                    count++;
                  }
                });
              }
            }
          });
          if (!errorCheck) {
            //delete all section for this project first
            const deleteSectionsQuery = `delete from Project_Sections where ID_Definition_Project = ${req.body.idProject}`;
            db.executeQuery(deleteSectionsQuery, (error, result) => {
              if (error || result.rowsAffected[0] === 0) {
                res.status(500).send({
                  error: {
                    status: true,
                    code: 54321,
                    source: "generalError",
                  },
                });
              } else {
                //Project Section,
                for (let i = 0; i < req.body.idSections.length; i++) {
                  const query2 = ` insert into Project_Sections(ID_Definition_Section, ID_Definition_Project) values(${req.body.idSections[i]}, ${req.body.idProject})`;
                  db.executeQuery(query2, (error, result) => {
                    if (error || result.rowsAffected[0] === 0) {
                      res.status(500).send({
                        error: {
                          status: true,
                          code: 54321,
                          source: "generalError",
                        },
                      });
                      return;
                    } else {
                      count++;
                      if (
                        !errorCheck &&
                        count ===
                          req.body.idSections.length +
                            req.body.idLanguages.length
                      ) {
                        res.status(200).send({
                          error: { status: false, code: 0, source: "" },
                        });
                      }
                    }
                  });
                }
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
        }
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

exports.deleteProject = async (req, res) => {
  if (req.body.hasOwnProperty("idProject")) {
    const deleteLanguagesQuery = `delete from RT_Project_Language where ID_Definition_Project = ${req.body.idProject}`;
    const deleteSectionsQuery = `delete from Project_Sections where ID_Definition_Project = ${req.body.idProject}`;
    const deleteProjectQuery = ` delete from Definition_Projects where ID_Definition_Project = ${req.body.idProject}`;
    db.executeQuery(deleteLanguagesQuery, (error, result) => {
      if (error || result.rowsAffected[0] === 0) {
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "generalError",
          },
        });
      } else {
        db.executeQuery(deleteSectionsQuery, (error, result) => {
          if (error || result.rowsAffected[0] === 0) {
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "generalError",
              },
            });
          } else {
            db.executeQuery(deleteProjectQuery, (error, result) => {
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

exports.copyKeysToNewLanguage = async (req, res) => {
  ///
};

exports.importKeysByProject = async (req, res) => {
  if (
    req.body.hasOwnProperty("idProject") &&
    req.body.hasOwnProperty("stringBase64")
  ) {
    //create folder, decoded base64 string and create .zip file on folders folder

    let data = req.body.stringBase64;
    let errorCheck = false;
    try {
      await mkdir(path.join(__dirname, "..", "folders"));
    } catch (error) {
      errorCheck = true;
      console.error(
        `Got an error trying to create the directory: ${error.message}`
      );
    }
    const buf = Buffer.from(data, "base64");
    const filePath = path.join(__dirname, "..", "folders/folders.zip");

    fs.writeFileSync(filePath, buf);

    const pathFolder = path.join(__dirname, "..", "folders/");
    var zip = new admZip(path.join(__dirname, "..", "folders/", "folders.zip"));
    // extract zip on path selected
    zip.extractAllTo(/*target path*/ pathFolder, /*overwrite*/ true);

    //delete zip
    try {
      await unlink(pathFolder + "/folders.zip");
    } catch (error) {
      errorCheck = true;
      console.error(`Got an error trying to delete the file: ${error.message}`);
    }

    // check folders have a correct structure, if not, throw error
    let correctStructure = true;
    let files = "";
    if (fs.existsSync(pathFolder + "i18n")) {
      try {
        files = fs.readdirSync(pathFolder + "i18n");
      } catch (error) {
        errorCheck = true;
        console.log(error);
      }
      // not empty and hace index.js on path
      if (!fs.readdirSync(pathFolder) || !files.includes("index.js")) {
        errorCheck = true;
        correctStructure = false;
      } else {
      }
      let sections = false;

      try {
        if (
          fs.existsSync(pathFolder + "i18/en-US") &&
          fs.lstatSync(pathFolder + "i18/en-US").isDirectory()
        ) {
          sections = true;
        }
      } catch (error) {
        errorCheck = true;
        console.log(error);
      }

      // have sections or not , two roads
      if (sections && !errorCheck) {
        let ararySections = [];
        files.forEach((languagesFolder) => {
          if (languagesFolder !== "index.js") {
            let languageSection = "";
            try {
              languageSection = fs.readdirSync(
                pathFolder + "i18/" + languagesFolder + "/"
              );
            } catch (error) {
              console.log(error);
            }
            ararySections.push(languageSection);
          }
        });
        let sectionsEquals = [];
        for (let i = 0; i < ararySections.length; i++) {
          let stringSections = "";
          for (let j = 0; j < ararySections[i].length; j++) {
            stringSections += ararySections[i][j];
          }
          sectionsEquals.push(stringSections);
        }
        const equals = !sectionsEquals.find(
          (sections) => sections !== sectionsEquals[0]
        );
        if (equals) {
          let languages = null;
          // obtain project languages
          const query = ` select distinct Code from VIEW_All_Projects where ID_Definition_Project = ${req.body.idProject} `;
          await db.executeQuery(query, (error, result) => {
            if (error) {
              errorCheck = true;
            } else {
              languages = result.recordset;
            }
          });
          let availableLanguages = [];
          languages.forEach((language) => {
            if (files.includes(language.Code)) {
              availableLanguages.push(language.Code);
            }
          });
          files = files.filter((file) => file !== "index.js");
          res.status(200).send({
            error: { status: false, code: 0, source: "" },
          });
        } else {
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "tooSectionsOnLanguage",
            },
          });
        }
      } else if (!errorCheck) {
        //no sections
        let json = false;
        let js = false;
        try {
          json = fs.existsSync(pathFolder + "i18n/en-US.json");
          js = fs.existsSync(pathFolder + "i18n/en-US.js");
          correctStructure = json || js;
        } catch (error) {
          console.log("bad estructure");
        }
        if (correctStructure) {
          let extension = js ? ".js" : ".json";
          let languages = [];
          let languagesAndCode = [];
          // obtain project languages
          const query = ` select distinct Code,ID_Definition_Language from VIEW_All_Projects where ID_Definition_Project = ${req.body.idProject} `;
          await db.executeQuery(query, (error, result) => {
            if (error) {
              errorCheck = true;
            } else {
              result.recordset.forEach((recordset) => {
                languages.push(`${recordset.Code}${extension}`);
                languagesAndCode.push(recordset);
              });
            }
          });
          if (!errorCheck) {
            // get languages to insert on database
            files = files.filter((file) => file !== "index.js");
            languages.filter((language) => files.includes(language));
            let keyWordsInEnglish = null;
            if (json) {
              let jsonToObject;
              try {
                jsonToObject = require(`${pathFolder}i18n/en-US.json`);
              } catch (error) {
                console.log(error);
              }
              keyWordsInEnglish = Object.keys(jsonToObject);
            } else {
              // keys in english
              try {
                keyWordsInEnglish = Object.keys(
                  require(`${pathFolder}i18n/en-US.js`).default
                );
              } catch (error) {
                console.log(error);
              }
            }
            // no duplicateds
            let keyWordsInEnglishToFilter = keyWordsInEnglish;
            for (let i = 0; i < keyWordsInEnglishToFilter.length; i++) {
              for (let j = 0; j < keyWordsInEnglishToFilter.length; j++) {
                if (
                  keyWordsInEnglishToFilter[i].toUpperCase() ===
                    keyWordsInEnglishToFilter[j].toUpperCase() &&
                  j !== i
                ) {
                  keyWordsInEnglish.splice(j, 1);
                }
              }
            }
            let allLanguagesFiltered = [];
            files.forEach((language) => {
              let words = js
                ? require(`${pathFolder}i18n/${language}`).default
                : require(`${pathFolder}i18n/${language}`);
              let keyWords = Object.keys(words);
              words = Object.entries(words);
              words = words.filter((word) =>
                keyWordsInEnglish.includes(word[0])
              );

              keyWordsInEnglish.forEach((key) => {
                if (!keyWords.includes(key)) {
                  words.push([key, ""]);
                }
              });
              let wordsFiltered = words;
              for (let i = 0; i < wordsFiltered.length; i++) {
                for (let j = 0; j < wordsFiltered.length; j++) {
                  if (wordsFiltered[i][0] === wordsFiltered[j][0] && j !== i) {
                    words.splice(j, 1);
                  }
                }
              }
              let objectLanguage = {
                [language.replace(extension, "")]: words,
              };
              allLanguagesFiltered.push(objectLanguage);
            });

            let allValuesReady = [];
            allLanguagesFiltered.forEach((languageSelected) => {
              let languageCode = Object.keys(languageSelected)[0];
              let idLanguageTo = languagesAndCode.find(
                (languageInfo) => languageInfo.Code === languageCode
              );
              languageSelected[languageCode].forEach((word) => {
                word[0] = word[0].replace(/'/g, "''");
                word[1] = word[1].replace(/'/g, "''");
                let value = `(${req.body.idProject},${idLanguageTo.ID_Definition_Language},1,N'${word[0]}',N'${word[1]}',null),`;
                allValuesReady.push(value);
              });
            });
            allValuesReady[allValuesReady.length - 1] = allValuesReady[
              allValuesReady.length - 1
            ].replace("null),", "null)");

            let stringValues = "";

            allValuesReady.forEach((value) => {
              stringValues += value;
            });

            // delete all words for this project in English
            const deleteEnglsihQuery = ` delete Translations where ID_Definition_Projects = ${req.body.idProject} and ID_Definition_Language = 1 `;
            await db.executeQuery(deleteEnglsihQuery, (error, result) => {
              if (error) {
                try {
                  fs.rmSync(pathFolder, { recursive: true });
                } catch (error) {
                  console.log(error);
                }
                res.status(500).send({
                  error: {
                    status: true,
                    code: 54321,
                    source: "badFileName",
                  },
                });
              } else {
                //delete all sections for this project where Section != No section
                const onlyNoSectionQuery = ` delete Project_Sections where ID_Definition_Project = ${req.body.idProject} and ID_Definition_Section != 1 `;
                db.executeQuery(onlyNoSectionQuery, (error, result) => {
                  if (error) {
                    try {
                      fs.rmSync(pathFolder, { recursive: true });
                    } catch (error) {
                      console.log(error);
                    }
                    res.status(500).send({
                      error: {
                        status: true,
                        code: 54321,
                        source: "badFileName",
                      },
                    });
                  } else {
                    const merge2 = `
                   WITH SourceData AS (
    SELECT 
        source.ID_Definition_Projects, 
        source.ID_Definition_Language, 
        source.Sections, 
        source.[Key], 
        source.[Value] AS Source_Value, 
        source.WordDescription AS Source_WordDescription
    FROM 
        (VALUES ${stringValues}) AS source (ID_Definition_Projects, ID_Definition_Language, Sections, [Key], [Value], WordDescription)
)
MERGE INTO Translations AS target
USING SourceData AS source
ON target.ID_Definition_Language = source.ID_Definition_Language
   AND target.[Key] = source.[Key]
   AND target.Sections = source.Sections
   AND target.ID_Definition_Projects = source.ID_Definition_Projects
WHEN MATCHED THEN
    UPDATE SET 
        target.[Value] = CASE
                             WHEN target.[Value] IS NULL THEN COALESCE(source.Source_Value, target.[Value])
                             ELSE target.[Value]
                         END,
        target.WordDescription = CASE
                                    WHEN target.[Value] IS NOT NULL THEN COALESCE(source.Source_WordDescription, target.WordDescription)
                                    ELSE COALESCE(source.Source_WordDescription, target.WordDescription)
                                  END
WHEN NOT MATCHED THEN
    INSERT (ID_Definition_Projects, ID_Definition_Language, Sections, [Key], [Value], WordDescription)
    VALUES (source.ID_Definition_Projects, source.ID_Definition_Language, source.Sections, source.[Key], source.Source_Value, source.Source_WordDescription)
OUTPUT
    source.ID_Definition_Projects,
    source.ID_Definition_Language,
    source.Sections,
    source.[Key],
    source.Source_Value AS New_Value,  -- Shows source value being inserted/updated
    inserted.[Value] AS Old_Value;  -- Shows the new value after the update in the target table
    `;

                    db.executeQuery(merge2, (error, result) => {
                      if (error) {
                        try {
                          fs.rmSync(pathFolder, { recursive: true });
                        } catch (error) {
                          console.log(error);
                        }
                        res.status(500).send({
                          error: {
                            status: true,
                            code: 54321,
                            source: "badFileName",
                          },
                        });
                      } else {
                        let data = result;
                        const deleteExcessWords = `  delete Translations
                        where ID_Definition_Projects = ${req.body.idProject} and
                        ID_Definition_Language != 1 and
                        [Key]  not in(
                          select [Key]
                          from Translations
                              where ID_Definition_Projects = ${req.body.idProject} and
                              ID_Definition_Language = 1)`;
                        db.executeQuery(deleteExcessWords, (error, result) => {
                          if (error) {
                            try {
                              fs.rmSync(pathFolder, { recursive: true });
                            } catch (error) {
                              console.log(error);
                            }
                            res.status(500).send({
                              error: {
                                status: true,
                                code: 54321,
                                source: "badFileName",
                              },
                            });
                          } else {
                            try {
                              fs.rmSync(pathFolder, { recursive: true });
                            } catch (error) {
                              console.log(error);
                            }
                            data = data.recordsets[0].filter(
                              (operation) =>
                                operation.ID_Definition_Language != 1 &&
                                operation.New_Value !== operation.Old_Value
                            );
                            res.status(200).send({
                              error: {
                                status: false,
                                code: 0,
                                source: "",
                              },
                              conflictsWords: data,
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          } else {
            try {
              fs.rmSync(pathFolder, { recursive: true });
            } catch (error) {
              console.log(error);
            }
            res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "badFileName",
              },
            });
          }
        } else {
          try {
            fs.rmSync(pathFolder, { recursive: true });
          } catch (error) {
            console.log(error);
          }
          res.status(500).send({
            error: {
              status: true,
              code: 54321,
              source: "badFileName",
            },
          });
        }
      } else {
        try {
          fs.rmSync(pathFolder, { recursive: true });
        } catch (error) {
          console.log(error);
        }
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "badFileName",
          },
        });
      }
    } else {
      try {
        fs.rmSync(pathFolder, { recursive: true });
      } catch (error) {
        console.log(error);
      }
      res.status(500).send({
        error: {
          status: true,
          code: 54321,
          source: "badFileName",
        },
      });
    }
  } else {
    try {
      fs.rmSync(pathFolder, { recursive: true });
    } catch (error) {
      console.log(error);
    }
    res.status(500).send({
      error: {
        status: true,
        code: 54321,
        source: "invalidParams",
      },
    });
  }
};
exports.insertConflictWords = async (req, res) => {
  if (
    req.body.hasOwnProperty("conflictWords") &&
    req.body.hasOwnProperty("email")
  ) {
    // one call for word
    // req.body.conflictWords.Key.replace(/'/g, "''");
    // req.body.conflictWords.Value.replace(/'/g, "''");

    // const query = ` update Translations set [Value] = N'${
    //   req.body.conflictWords.Value
    // }', LastUserModification = '${
    //   req.body.email
    // }', LastDateModification = '${moment().format(
    //   "YYYY-MM-DD HH:mm:ss.SSS"
    // )}'  where ID_Definition_Projects = ${
    //   req.body.conflictWords.ID_Definition_Projects
    // } and [Key] = '${req.body.conflictWords.Key}' and ID_Definition_Language = ${
    //   req.body.conflictWords.ID_Definition_Language
    // }`;
    // db.executeQuery(query, (error, result) => {
    //   if (error || result.rowsAffected[0] === 0) {
    //     res.status(500).send({
    //       error: {
    //         status: true,
    //         code: 54321,
    //         source: "generalError",
    //       },
    //     });
    //   } else {
    //     res.status(200).send({
    //       error: {
    //         status: false,
    //         code: 0,
    //         source: "",
    //       },
    //     });
    //   }
    // });

    //one call for all words
    let wordsToDelete = "";
    let wordsToInsert = "";
    for (let i = 0; i < req.body.conflictWords.length; i++) {
      req.body.conflictWords[i].Key.replace(/'/g, "''");
      req.body.conflictWords[i].Value.replace(/'/g, "''");

      if (req.body.conflictWords.length - 1 === i) {
        wordsToDelete += `([Key] = '${req.body.conflictWords[i].Key}' and ID_Definition_Language = ${req.body.conflictWords[i].ID_Definition_Language}));`;
        wordsToInsert += `(N'${req.body.conflictWords[i].Key}', N'${
          req.body.conflictWords[i].Value
        }', ${req.body.conflictWords[i].ID_Definition_Language}, 1, ${
          req.body.conflictWords[i].ID_Definition_Projects
        },'${req.body.email}','${moment().format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )}');`;
      } else {
        wordsToDelete += `([Key] = '${req.body.conflictWords[i].Key}' and ID_Definition_Language = ${req.body.conflictWords[i].ID_Definition_Language}) or`;
        wordsToInsert += `(N'${req.body.conflictWords[i].Key}', N'${
          req.body.conflictWords[i].Value
        }', ${req.body.conflictWords[i].ID_Definition_Language}, 1, ${
          req.body.conflictWords[i].ID_Definition_Projects
        },'${req.body.email}','${moment().format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )}'),`;
      }
    }
    const deleteWordsquery = ` delete Translations where ID_Definition_Projects = ${req.body.conflictWords[0].ID_Definition_Projects} and ( ${wordsToDelete}`;
    const insertQuery = ` insert into Translations ([Key],Value,ID_Definition_Language,Sections,ID_Definition_Projects,LastUserModification,LastDateModification) values ${wordsToInsert}`;
    db.executeQuery(deleteWordsquery, (error, result) => {
      if (error || result.rowsAffected[0] === 0) {
        res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "generalError",
          },
        });
      } else {
        db.executeQuery(insertQuery, (error, result) => {
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
              error: {
                status: false,
                code: 0,
                source: "",
              },
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

exports.haveTranslations = async (req, res) => {
  if (req.query.hasOwnProperty("idProject")) {
    const query = `select [Value] as valueFront from Translations where ID_Definition_Projects = ${req.query.idProject};`;
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
        console.log(result.recordset)
        let notEmpty =
          result.recordset.length > 0;
        let haveTranlatios = [result.recordset.find((word) => word.Value !== "" || null)];
        res.status(200).send({
          error: {
            status: false,
            code: 0,
            source: "",
          },
          data: {
            hasFrontTranslations: notEmpty && haveTranlatios.length>0,
          },
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
