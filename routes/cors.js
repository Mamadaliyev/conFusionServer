const express = require("express");
const cors = require("cors");
const app = express();

const whiteList = ["https://localhost:3443", "http://localhost:3000"];

var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  console.log(req.header("Origin"));
  if (whiteList.indexOf(req.header("Origin")) !== -1) {
    corsOptions = {
      origin: true,
    };
  } else {
    corsOptions = {
      origin: false,
    };
  }
  console.log(corsOptions);

  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
