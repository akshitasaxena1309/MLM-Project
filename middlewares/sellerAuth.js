require("dotenv").config();
const jwt = require("jsonwebtoken");

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const restrictedArea = async (req, res, next) => {
  const token = req.body.sellerToken || req.cookies.sellerToken;
  try {
    if (token) {
      if (token) {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);
        if (payload) {
          req.user = payload;
          next();
        } else {
          res.status(400).json({ error: "token verification failed" });
        }
      } else {
        res.status(400).json({ error: "malformed auth header" });
      }
    } else {
      res.redirect("/seller/loginPage");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

module.exports = {
  restrictedArea,
};
