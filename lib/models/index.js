const path = require("path");
const fs = require("fs");
const basename = path.basename(__filename);
const Sequelize = require("sequelize");
const logger = require("../../src/utils/logger");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: "+05:30",
    //logging: (msg) => logger.info(msg),
    logging: false,
    pool: {
      max: 50,
      min: 0,
      idle: 10000,
    },
  }
);

let db = {};
sequelize
  .authenticate()
  .then(() => {
    //sequelize.sync({ ALTER: true });
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    logger.error(
      `${500} - [ 'Database' ] - [ Unable to connect to the database ] - ${err}`
    );
    console.error("Unable to connect to the database:", err);
  });

db.Sequelize = Sequelize;
db.sequelize = sequelize;
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });
module.exports = db;
