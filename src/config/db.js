"use strict";

const mariadb = require("mariadb");
const dotenv=  require('dotenv')
dotenv.config();


const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password:process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 100,
  acquireTimeout: 20000,
  idleTimeout: 60000,
  queueLimit: 150,
  connectTimeout: 15000,
});

module.exports = {
  executeQuery(query, callback) {
    // Creando la conexión con la BD
    pool
      .getConnection()
      .then((conn) => {
        // Conexión con la BD realizada correctamente
        conn
          .query(query)
          .then((rows) => {
            // Query ejecutada correctamente
            callback(null, rows);
          })
          .catch((err) => {
            // Error al ejecutar la query
            console.log("error executing query: " + err);
            callback(err, null);
          })
          .finally(() => {
            if (conn) {
              conn.release();
            }
          });

        // Se cierra la conexión con la base de datos
        //conn.end();
      })
      .catch((err) => {
        // Error creando la conexión con la BD
        if (err.code === "ER_GET_CONNECTION_TIMEOUT") {
          console.error(
            "ER_GET_CONNECTION_TIMEOUT. An error occurred while establishing a connection to the database. Please verify that the IP address is correct."
          );
        } else {
          console.log(err);
        }
        callback(null, null);
      });
  },
  pool: pool,
  async executeQueriesTransactions(queries, callback) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      for (const query of queries) {
        await conn.query(query);
      }
      await conn.commit();
      callback(null, "All queries were executed successfully");
    } catch (err) {
      // Si hay algún error, hacer rollback de la transacción
      if (conn) await conn.rollback();
      console.error("Error in transaction: ", err);
      callback(err, null);
    } finally {
      if (conn) conn.release();
    }
  },
};
