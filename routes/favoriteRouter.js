const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorite");
const { populate } = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          let favDishes = req.body;
          for (let i = 0; i < favDishes.length; ++i) {
            if (!favorites.dishes.includes(favDishes[i]._id))
              favorites.dishes.push(favDishes[i]._id);
          }
          favorites
            .save()
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            })
            .catch((err) => next(err));
        } else {
          Favorites.create({
            user: req.user._id,
          })
            .then(
              (favorites) => {
                let favDishes = req.body;
                for (let i = 0; i < favDishes.length; ++i) {
                  if (!favorites.dishes.includes(favDishes[i]._id))
                    favorites.dishes.push(favDishes[i]._id);
                }
                favorites.save().then((favorites) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorites);
                });
              },
              (err) => next(err)
            )
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.sendStatus = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("The favorites not found");
        }
      })
      .catch((err) => {
        next(err);
      });
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          if (!favorites.dishes.includes(req.params.dishId)) {
            favorites.dishes.push(req.params.dishId);
            favorites
              .save()
              .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.statusCode = 403;
            res.setHeader("Content-Type", "text/plain");
            res.end("The dish has been already added to favorites");
          }
        } else {
          Favorites.create({
            user: req.user._id,
          })
            .then((favorites) => {
              favorites.dishes.push(req.params.dishId);
              favorites.save().then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          let index = favorites.dishes.indexOf(req.params.dishId);
          if (index !== -1) {
            favorites.dishes.splice(index, 1);
            favorites
              .save()
              .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              })
              .catch((err) => {
                next(err);
              });
          } else {
            res.statusCode = 403;
            res.setHeader("Content-Type", "text/plain");
            res.end("The dish hasn't been found in this user");
          }
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("This user's favorites is not defined");
        }
      })
      .catch((err) => {
        next(err);
      });
  });
module.exports = favoriteRouter;
