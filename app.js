// Check node min version to start app
checkNodeMinVersion();

// BigInt numbers produces error when try to send the response in JSON
// This function prevent this error casting the BigInt number to integer or to string
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 7002;

// Allowed origins for CORS
const allowedOrigins = [
  "https://green-water-0733aec1e.6.azurestaticapps.net",
  "http://localhost:9000",
  "http://127.0.0.1:9000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir sin origen (postman, backend, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // No es un error, pero no permetem aquest origen
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "langi18n",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
};

// Middleware CORS
app.use(cors(corsOptions));

// Resposta explícita a preflight OPTIONS per a totes les rutes
app.options("*", cors(corsOptions));

// Augmentar límit de peticions per poder rebre imatges base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Importar rutes
const login = require("./src/routes/Login/loginRoutes.js");
const register = require("./src/routes/Register/registerRoutes.js");
const travels = require("./src/routes/Travels/travelsRoutes.js");
const messages = require("./src/routes/Messages/messagesRoutes.js");
const contacts = require("./src/routes/Contacts/ContactsRoutes.js");
const users = require("./src/routes/User/userRoutes.js");

// Aplicar rutes
login(app);
register(app);
messages(app);
travels(app);
contacts(app);
users(app);

// Middleware per capturar errors, inclòs errors CORS
app.use(function (err, req, res, next) {
  if (err) {
    console.error("Error detected:", err.message);
    if (err.message.includes("CORS")) {
      return res.status(403).send("CORS Error: Origen no permès");
    }
    return res.status(500).send("Internal Server Error");
  }
  next();
});

app.listen(port, () => {
  console.log(`Backend Travels app listening at http://localhost:${port}`);
});

// Funció per comprovar versió mínima de Node.js
function checkNodeMinVersion() {
  const requiredVersion = 22;
  const currentVersion = process.versions.node.split(".")[0];

  if (parseInt(currentVersion) < requiredVersion) {
    console.error(
      `⚠️  Error:  Node.js v${requiredVersion} or higher is required. You are currently using v${process.versions.node}.`
    );
    process.exit(1);
  }
}
