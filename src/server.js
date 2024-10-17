require("dotenv").config();
const express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  path = require("path");

const { Response } = require("../lib/http-response");
var _ = require("lodash");
const { __ } = require("../lib/i18n");

const app = express();
app.use((req, res, next) => {
  req.__ = __;
  for (const method in Response) {
    if (Response.hasOwnProperty(method)) res[method] = Response[method];
  }
  next();
});

var logger = function (request, response, next) {
  var accessedPath = request.path;
  // do something with the accessed path
  next();
};

app.use(logger); // for all routes
// app config
app.use(cors()); //cors
app.use(bodyParser.json({ limit: "100mb" })); //body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../static"))); //static path
app.use("/", require("./routes")); //routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img/', express.static(path.join(__dirname, '../public/images/')));

app.set("view engine", "ejs"); //template engine


const port = process.env.PORT || 3000;
// Server
if (process.env.SERVER_MODE === "https") {
  const http = require("http");
  server = http.createServer(app);
} else {
  const http = require("http");
  server = http.createServer(app);
}

server.listen(port, function () {
  console.info(`Server Started on port---- ${port}`);
});
