let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
let jwt = require("jsonwebtoken"); //used to create, sign, and verify tokens

let config = require("./config");

let User = require("./models/user");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, {
    expiresIn: 3600,
  });
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
  if (!req.user.admin) {
    let err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    next(err);
  }
  next();
};
