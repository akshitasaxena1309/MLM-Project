const mongoose = require("mongoose");
require("dotenv").config();
exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {})
    .then(() => {
      console.log("DB connected");
    })
    .catch((err) => {
      console.log("Connection Issues");
      console.error(err); // Log the error message
      process.exit(1);
    });
};
