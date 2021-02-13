let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;

let User = require("./models/user");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
