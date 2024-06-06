require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");

// require("dotenv").config();
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

const rootRouter = require("./routes/rootRouter");
const adminRouter = require("./routes/adminRouter");
const userRouter = require("./routes/userRouter");
const sellerRouter = require("./routes/sellerRouter");
require("./config/database").connect();

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/seller", sellerRouter);
app.use("/", rootRouter);

// const port = 3000;

app.listen(3000, () => {
  console.log(`Server is running`);
});
