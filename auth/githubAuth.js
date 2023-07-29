const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { GithubModel } = require("../model/githubModel");
const GitHubStrategy = require("passport-github2").Strategy;
const githubAuthRouter = express.Router();
require("dotenv").config();

githubAuthRouter.use(
  session({
    secret: "your_secret_key", // Replace 'your_secret_key' with a strong random string
    resave: false,
    saveUninitialized: false,
  })
);

githubAuthRouter.use(passport.initialize());
githubAuthRouter.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

githubAuthRouter.get("/github/users", async (req, res) => {
  try {
    let allUsersData = await GithubModel.find();
    res.send(allUsersData);
  } catch (error) {
    console.log("something wrong in /allusers");
    console.log(error);
  }
});

githubAuthRouter.get("/github/success", async (req, res) => {
  try {
    res.send("Hello Github!");
  } catch (error) {
    console.log("error in /", error);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.github_id,
      clientSecret: process.env.github_secret,
      callbackURL: "/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let data = await GithubModel.findOne({ "profile.id": profile.id });
        if (data == null) {
          // Create a new instance of GithubModel with the entire profile object
          let newGithubUser = new GithubModel({
            profile: profile,
          });

          // Save the new instance to the database
          await newGithubUser.save();
          done(null, profile);
        } else {
          await GithubModel.findByIdAndUpdate(data._id, profile);
          console.log("Login successful");
          done(null, profile);
        }
      } catch (error) {
        done(error, false); // Pass the error to done() as the first argument
      }
    }
  )
);

githubAuthRouter.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["profile"] })
);

githubAuthRouter.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    if (req.isAuthenticated()) {
      console.log(req.user, req.isAuthenticated());
      res.redirect("/github/success");
    } else {
      res.redirect("/auth/fail");
    }
  }
);

githubAuthRouter.get("/github/logout", (req, res) => {
  req.logout();
  res.send("user is logged out");
});

module.exports = { githubAuthRouter };
