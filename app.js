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
const port = 7002;
// for developers
app.use(cors());

// Increase request size limit to 50 MB to allow receiving base64 imgs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization,langi18n"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
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

login(app);
register(app);
messages(app);
travels(app);
contacts(app);
users(app);

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
