const jwt = require("jsonwebtoken");
const Users = require("../../lib/models").users;
const TableSchema = require("../services");

const signToken = (user) => {
  const payload = {
    sub: user.id,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "365d" });
};

const verifyToken = (req, res, next) => {
  jwt.verify(
    req.headers["authorization"],
    process.env.JWT_SECRET,
    async (err, decoded) => {
      if (err || !decoded || !decoded.sub) {
        return res.warn(null, req.__("UNAUTHORIZED"));
      }
      const user = await TableSchema.get(
        {
          attributes: Users.selectFields(),
          where: { id: decoded.sub, token: req.headers["authorization"] },
        },
        Users
      );
      if (!user) {
        return res.warn(null, req.__("UNAUTHORIZED"));
      }
      req.user = user;
      next();
    }
  );
};

module.exports = {
  signToken,
  verifyToken,
};
