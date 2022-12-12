const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
// to call secret variable, use "process.env.JWT".
//
const express = require("express");
const app = express();
const {
  models: { User },
} = require("./db");
const path = require("path");

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});
/* Take a look at the GET route to "/api/auth". This route assumes that the authorization
header has been set on the request and it uses that to verify the user by its token. 
It also uses a class method which has all the logic for handling the token. Replace this
logic with your own so that you verify the given token was signed by your app. If it was,
you can use the data in the token to identify the user and pull all their information  
from the database. The route should ultimately return a full user object.*/

app.get("/api/auth", async (req, res, next) => {
  try {
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
