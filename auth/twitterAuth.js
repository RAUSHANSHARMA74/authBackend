const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { TwitterModel } = require("../model/twitterModel");
const TwitterStrategy = require("passport-twitter").Strategy;
const twitterAuthRouter = express.Router();
require("dotenv").config();

// Add express-session middleware with desired configurations
twitterAuthRouter.use(
  session({
    secret: "your_secret_key", // Replace 'your_secret_key' with a strong random string
    resave: false,
    saveUninitialized: false,
  })
);

twitterAuthRouter.use(passport.initialize());
twitterAuthRouter.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

twitterAuthRouter.get("/twitter/users", async (req, res)=>{
  try {
    let allUsersData = await TwitterModel.find()
    res.send(allUsersData)
  } catch (error) {
    console.log("something wrong in /allusers")
    console.log(error)
  }
})


twitterAuthRouter.get("/twitter/success", async (req, res) => {
  try {
    res.send("Hello twitter!");
  } catch (error) {
    console.log("error in /twitter", error);
  }
});



passport.use(new TwitterStrategy({
    consumerKey: process.env.twitter_key,
    consumerSecret: process.env.twitter_secret,
    callbackURL: "/auth/twitter/callback"
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      let data = await TwitterModel.findOne({ "profile.id": profile.id });
      if (data == null) {
        let newTwitterUser = new TwitterModel({
          profile: profile,
        });
        await newTwitterUser.save();
        done(null, profile);
      } else {
        await TwitterModel.findByIdAndUpdate(data._id , profile);
        console.log("Login successful");
        done(null, profile);
      }
    } catch (error) {
      done(error, false);
    }
  }
));

twitterAuthRouter.get(
  "/auth/twitter",
  passport.authenticate("twitter", { scope: ["profile"] })
);

twitterAuthRouter.get(
  "/auth/twitter/callback",
  (req, res, next) => {
    passport.authenticate("twitter", { failureRedirect: "/auth/fail" })(req, res, next);
  },
  (req, res) => {
    console.log(req.user, req.isAuthenticated());
    res.redirect("/auth/success")
  }
);

twitterAuthRouter.get("/twitter/logout", (req, res) => {
  req.logout();
  res.send("user is logged out from twitter");
});


module.exports = { twitterAuthRouter };
