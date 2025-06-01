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
let express = require("express"),
  app = express(),
  bodyParser = require("body-parser");
jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
// for developers

// Increase request size limit to 50 MB to allow receiving base64 imgs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add headers
const allowedOrigins = [
  "https://main.d1eqcxpofh2s7b.amplifyapp.com",
  "http://localhost:9000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // Si quieres permitir cookies:
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, langi18n, X-Requested-With"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let login = require("./src/routes/Login/loginRoutes.js");
let register = require("./src/routes/Register/registerRoutes.js");
let travels = require("./src/routes/Travels/travelsRoutes.js");
let messages = require("./src/routes/Messages/messagesRoutes.js");
let contacts = require("./src/routes/Contacts/ContactsRoutes.js");
let users = require("./src/routes/User/userRoutes.js");
let health = require("./src/routes/Health/healthRouter.js");

login(app);
register(app);
messages(app);
travels(app);
contacts(app);
users(app);
health(app);

// app.listen(port, "0.0.0.0", () => {
//   console.log(`Backend Travels app listening at http://0.0.0.0:${port}`);
// });
app.listen(port, () => {
  console.log(`Backend Travels app listening at http://localhost:${port}`);
});
function checkNodeMinVersion() {
  const requiredVersion = 22;
  const currentVersion = process.versions.node.split(".")[0];

  if (parseInt(currentVersion) < requiredVersion) {
    console.error(
      `⚠️  Error: Node.js v${requiredVersion} or higher is required. You are currently using v${process.versions.node}.`
    );
    process.exit(1);
  }
}
