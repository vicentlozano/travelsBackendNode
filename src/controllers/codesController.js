"use strict";
const db = require("../config/db");

exports.getAllTravels = async (req, res) => {
  const query = ` SELECT 
    us.ID_User,
    MAX(us.RegisterCode) AS RegisterCode,  
    MAX(us.CreatedTo) AS CreatedTo,         
    STRING_AGG(upl.Code, ', ') AS Codes    
    FROM 
        Users AS us
    JOIN 
        VIEW_RT_User_Project_Language AS upl ON us.ID_User = upl.ID_User
    WHERE 
        us.RegisterCode IS NOT NULL
    GROUP BY 
        us.ID_User
    ORDER BY 
    us.ID_User DESC;`;
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
      let users = result.recordset;
      let data = [];
      for (let i = 0; i < users.length; i++) {
        let user = {
          code: users[i].RegisterCode,
          idUser: users[i].ID_User,
          createdto: users[i].CreatedTo,
          codes: users[i].Codes.split(","),
        };
        data.push(user);
      }
      res.status(200).send({
        error: { status: false, code: 0, source: "" },
        data: data,
      });
    }
  });
};
