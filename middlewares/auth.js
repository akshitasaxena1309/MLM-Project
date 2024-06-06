require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const isLoggedIn = async (req, res, next) => {
  const token = req.body.admintoken || req.cookies.admintoken;
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
      res.redirect("/admin");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Admin",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role is not matching on route",
    });
  }
};

// export custom middleware
module.exports = {
  isLoggedIn,
  isAdmin,
};
