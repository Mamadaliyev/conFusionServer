var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const authenticate = require("./authenticate");

const Dishes = require("./models/dishes");
const Promotions = require("./models/promotions");
const Leaders = require("./models/leaders");

const url = "mongodb://localhost:27017/conFusion";

const connect = mongoose.connect(url);
var app = express();

connect.then(
  (db) => {
    console.log("Connected correctly to  server");
  },
  (err) => {
    console.log(err);
  }
);
app.use(
  session({
    name: "session-id",
    secret: "123456-7890",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

app.use("/", indexRouter);
app.use("/users", usersRouter);

function auth(req, res, next) {
  if (!req.user) {
    var err = new Error("You are not authenticated");
    res.setHeader("WWW-Authenticate", "Basic");
    err.status = 403;
    return next(err);
  } else {
    next();
  }
}

var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");

// view engine setup
// app.use(cookieParser("123456-7890"));

app.use(auth);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
