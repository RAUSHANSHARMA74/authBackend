const express = require("express");
const passport = require("passport");
const session = require("express-session");
// const path = require("path");
const { GithubModel } = require("../model/githubModel");
const {sendMail} = require("../mailSender/mail")
const GitHubStrategy = require("passport-github2").Strategy;
const githubAuthRouter = express.Router();
require("dotenv").config();



let userEmail;
let userName;

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
    console.log("something wrong in /github/users");
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});


// githubAuthRouter.use(express.static(path.join(__dirname, "https://funapplication.netlify.app")));
githubAuthRouter.get("/github/success", async (req, res) => {
  try {
    // const filePath = path.join(__dirname, "https://funapplication.netlify.app/html/final.html");
    // res.sendFile(filePath);
    res.send("hello Github!")
  } catch (error) {
    console.log("error in /github/success", error);
    res.status(500).send("Internal Server Error");
  }
});


passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.github_id,
      clientSecret: process.env.github_secret,
      callbackURL: "https://authbackend-rbqn.onrender.com/auth/github/callback",
      scope: ["user:email"], // Request the 'user:email' scope to get the user's email
    },
    async function (accessToken, refreshToken, profile, done) {
      userEmail = profile.emails[0].value
      userName = profile.displayName
      try {
        let data = await GithubModel.findOne({ "profile.id": profile.id });
        if (data == null) {
          let newGithubUser = new GithubModel({
            profile: profile,
          });
          await newGithubUser.save();
          done(null, profile);
        } else {
          await GithubModel.findByIdAndUpdate(data._id, profile);
          console.log("Login successful");
          done(null, "login successful");
        }
      } catch (error) {
        done(error, false);
      }
    }
  )
);

githubAuthRouter.get(
  "/auth/github",
  passport.authenticate("github")
);

githubAuthRouter.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    if (req.isAuthenticated()) {
      sendMail(userEmail, userName)
      res.redirect("/github/success");
    } else {
      res.redirect("/auth/fail");
    }
  }
);

githubAuthRouter.get("/github/logout", (req, res) => {
  req.logout();
  res.send("user is logged out from GitHub");
});

module.exports = { githubAuthRouter };
