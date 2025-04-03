"use strict";

const db = require("../config/db");

exports.getProjectLanguagesQuantity = async (req, res) => {
  const queryNotFullyTranslated = `SELECT 
            ID_Definition_Project,
            [Description],
            Code,
            DescriptionLanguage,
            ID_Definition_Language,
            TranslationsCount,
            wordCount
        FROM (
            -- Subconsulta para obtener los conteos de traducciones y palabras agrupadas por proyecto e idioma
            SELECT 
                ID_Definition_Project,
                [Description],
                Code,
                DescriptionLanguage,
                ID_Definition_Language,
                COUNT(CASE WHEN Value IS NOT NULL THEN 1 END) AS TranslationsCount,
                COUNT([Key]) AS wordCount
            FROM
                VIEW_Project_Languages
            GROUP BY
                ID_Definition_Project,
                [Description],
                Code,
                DescriptionLanguage,
                ID_Definition_Language
        ) AS Subquery
        WHERE ID_Definition_Project IN (
            -- Subconsulta para filtrar los proyectos donde no todos los idiomas tienen PorcentajeIdioma igual a 100%
            SELECT ID_Definition_Project
            FROM (
                -- Subconsulta para calcular el número total de idiomas y el número de idiomas completos por proyecto
                SELECT 
                    ID_Definition_Project,
                    COUNT(DISTINCT ID_Definition_Language) AS TotalLanguages,
                    COUNT(CASE WHEN CAST(TranslationsCount AS DECIMAL) / NULLIF(CAST(wordCount AS DECIMAL), 0) = 1 THEN 1 END) AS CompleteLanguages
                FROM (
                    -- Subconsulta para obtener los conteos de traducciones y palabras agrupadas por proyecto e idioma
                    SELECT 
                        ID_Definition_Project,
                        ID_Definition_Language,
                        COUNT(CASE WHEN Value IS NOT NULL THEN 1 END) AS TranslationsCount,
                        COUNT([Key]) AS wordCount
                    FROM
                        VIEW_Project_Languages
                    GROUP BY
                        ID_Definition_Project,
                        ID_Definition_Language
                ) AS LanguageData
                GROUP BY
                    ID_Definition_Project
            ) AS ProjectSummary
            WHERE TotalLanguages > CompleteLanguages -- Filtra los proyectos donde al menos un idioma no tiene PorcentajeIdioma igual a 100%
        )
        ORDER BY 
            CASE WHEN ID_Definition_Language = 1 THEN 0 ELSE 1 END,
            100.0 * SUM(TranslationsCount) OVER (PARTITION BY ID_Definition_Project) / NULLIF(SUM(wordCount) OVER (PARTITION BY ID_Definition_Project), 0) DESC,
            DescriptionLanguage ASC,
            [Description] ASC;`;
  const queryFullyTranslated = `SELECT 
            ID_Definition_Project,
            [Description],
            Code,
            DescriptionLanguage,
            ID_Definition_Language,
            TranslationsCount,
            wordCount
        FROM (
            SELECT 
                ID_Definition_Project,
                [Description],
                Code,
                DescriptionLanguage,
                ID_Definition_Language,
                COUNT(CASE WHEN Value IS NOT NULL THEN 1 END) AS TranslationsCount, -- Cuenta las traducciones completas
                COUNT([Key]) AS wordCount -- Cuenta las palabras totales
            FROM
                VIEW_Project_Languages
            GROUP BY
                ID_Definition_Project,
                [Description],
                Code,
                DescriptionLanguage,
                ID_Definition_Language
        ) AS Subquery
        WHERE ID_Definition_Project IN (
            SELECT ID_Definition_Project
            FROM (
                SELECT 
                    ID_Definition_Project,
                    COUNT(DISTINCT ID_Definition_Language) AS TotalLanguages, -- Cuenta el total de idiomas
                    COUNT(CASE WHEN CAST(TranslationsCount AS DECIMAL) / NULLIF(CAST(wordCount AS DECIMAL), 0) = 1 THEN 1 END) AS CompleteLanguages -- Cuenta los idiomas completos (PorcentajeIdioma igual a 100%)
                FROM (
                    SELECT 
                        ID_Definition_Project,
                        ID_Definition_Language,
                        COUNT(CASE WHEN Value IS NOT NULL THEN 1 END) AS TranslationsCount, -- Cuenta las traducciones completas
                        COUNT([Key]) AS wordCount -- Cuenta las palabras totales
                    FROM
                        VIEW_Project_Languages
                    GROUP BY
                        ID_Definition_Project,
                        ID_Definition_Language
                ) AS LanguageData
                GROUP BY
                    ID_Definition_Project
            ) AS ProjectSummary
            WHERE TotalLanguages = CompleteLanguages -- Filtra los proyectos donde todos los idiomas están completos
        )
        ORDER BY 
            CASE WHEN ID_Definition_Language = 1 THEN 0 ELSE 1 END,
            100.0 * SUM(TranslationsCount) OVER (PARTITION BY ID_Definition_Project) / NULLIF(SUM(wordCount) OVER (PARTITION BY ID_Definition_Project), 0) DESC,
            DescriptionLanguage ASC,
            [Description] ASC`;
  const groupedProjects = [];
  let orderedAndGroupedProjects = [];
  db.executeQuery(queryNotFullyTranslated, (err, results) => {
    if (err) {
      if (err.message.includes("acces") || err.message.includes("Level")) {
        return res.status(500).send({
          error: {
            status: false,
            code: 54321,
            source: "noAccesLevel",
          },
        });
      } else {
        return res.status(500).send({
          error: {
            status: true,
            code: 54321,
            source: "generalError",
          },
        });
      }
    } else {
      groupedProjects.push(results.recordset);
      db.executeQuery(queryFullyTranslated, (err, results) => {
        if (err) {
          if (err.message.includes("acces") || err.message.includes("Level")) {
            return res.status(500).send({
              error: {
                status: false,
                code: 54321,
                source: "noAccesLevel",
              },
            });
          } else {
            return res.status(500).send({
              error: {
                status: true,
                code: 54321,
                source: "generalError",
              },
            });
          }
        } else {
          groupedProjects.push(results.recordset);
          for (
            let arrayProjectes = 0;
            arrayProjectes < groupedProjects.length;
            arrayProjectes++
          ) {
            orderedAndGroupedProjects = groupedProjects
              .flat()
              .reduce((acc, row) => {
                const {
                  ID_Definition_Project,
                  Description,
                  Code,
                  DescriptionLanguage,
                  TranslationsCount,
                  wordCount,
                  ID_Definition_Language,
                } = row;
                if (!acc[ID_Definition_Project]) {
                  acc[ID_Definition_Project] = {
                    idProject: ID_Definition_Project,
                    project: Description,
                    arrayProject: [],
                  };
                }
                acc[ID_Definition_Project].arrayProject.push({
                  code: Code,
                  language: DescriptionLanguage,
                  translationCount: TranslationsCount,
                  wordCount: wordCount,
                  ID_Definition_Language: ID_Definition_Language,
                });
                return acc;
              }, {});
          }
          const allprojects = Object.values(orderedAndGroupedProjects);
          res.send({
            error: {
              status: false,
              code: 0,
              source: "",
            },
            data: {
              allprojects,
            },
          });
        }
      });
    }
  });
};
