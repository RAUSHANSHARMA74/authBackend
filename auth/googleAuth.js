const express = require("express");
const passport = require("passport");
// const path = require("path");
const session = require("express-session");
const { GoogleModel } = require("../model/googleModel");
const { sendMail } = require("../mailSender/mail");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googleAuthRouter = express.Router();
require("dotenv").config();

let userEmail;
let userName;

googleAuthRouter.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

googleAuthRouter.use(passport.initialize());
googleAuthRouter.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

googleAuthRouter.get("/allusers", async (req, res) => {
  try {
    let allUsersData = await GoogleModel.find();
    res.send(allUsersData);
  } catch (error) {
    console.log("something wrong in /allusers");
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

googleAuthRouter.get("/auth/fail", async (req, res) => {
  try {
    res.send("something went wrong");
  } catch (error) {
    console.log("error in /auth/fail", error);
    res.status(500).send("Internal Server Error");
  }
});


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.google_id,
      clientSecret: process.env.google_secret,
      callbackURL: "https://authbackend-rbqn.onrender.com/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      userName = profile.displayName;
      userEmail = profile.emails[0].value;
      try {
        let data = await GoogleModel.findOne({ "profile.id": profile.id });
        if (data == null) {
          let newGoogleUser = new GoogleModel({
            profile: profile,
          });
          await newGoogleUser.save();
          done(null, profile);
        } else {
          await GoogleModel.findByIdAndUpdate(data._id, profile);
          done(null, "Login successful");
        }
      } catch (error) {
        done(error, false);
      }
    }
  )
);

googleAuthRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

googleAuthRouter.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { failureRedirect: "/auth/fail" })(req, res, next);
  },
  (req, res) => {
    console.log(req.user, req.isAuthenticated());
    sendMail(userEmail, userName);
    res.redirect("https://funapplication.netlify.app/html/final.html");
  }
);

googleAuthRouter.get("/logout", (req, res) => {
  req.logout();
  res.send("user is logged out");
});

module.exports = { googleAuthRouter };
