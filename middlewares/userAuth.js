require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const restrictedArea = async (req, res, next) => {
  const token = req.body.token || req.cookies.token;
  try {
    // check if auth header exists
    if (token) {
      // parse token from header
      //   const token = req.headers.authorization.split(' ')[1]; //split the header and get the token
      if (token) {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);
        if (payload) {
          // store user data in request object
          req.user = payload;
          next();
        } else {
          res.status(400).json({ error: "token verification failed" });
        }
      } else {
        res.status(400).json({ error: "malformed auth header" });
      }
    } else {
      res.redirect("/user/loginPage");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

// export custom middleware
module.exports = {
  restrictedArea,
};
