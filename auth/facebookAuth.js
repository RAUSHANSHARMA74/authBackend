const express = require("express");
const passport = require("passport");
const { FacebookModel } = require("../model/facebookModel");
const session = require("express-session");
const FacebookStrategy = require("passport-facebook").Strategy;
const facebookAuthRouter = express.Router();
require("dotenv").config();

facebookAuthRouter.use(
  session({
    secret: "your_secret_key", // Replace 'your_secret_key' with a strong random string
    resave: false,
    saveUninitialized: false,
  })
);

facebookAuthRouter.use(passport.initialize());
facebookAuthRouter.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

facebookAuthRouter.get("/facebook/users", async (req, res)=>{
  try {
    let allUsersData = await FacebookModel.find()
    res.send(allUsersData)
  } catch (error) {
    console.log("something wrong in /facebook/users")
    console.log(error)
  }
})


facebookAuthRouter.get("/facebook/success", async (req, res) => {
  try {
    res.send("Hello facebook!");
  } catch (error) {
    console.log("error in /", error);
  }
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.facebook_id,
      clientSecret: process.env.facebook_secret,
      callbackURL: "https://authbackend-rbqn.onrender.com/auth/facebook/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let data = await FacebookModel.findOne({ "profile.id": profile.id });
        if (data == null) {
          // Create a new instance of FacebookModel with the entire profile object
          let newFacebookUser = new FacebookModel({
            profile: profile,
          });

          // Save the new instance to the database
          await newFacebookUser.save();
          done(null, profile);
        } else {
          await FacebookModel.findByIdAndUpdate(data._id, profile);
          console.log("Login successful");
          done(null, profile);
        }
      } catch (error) {
        done(error, false); // Pass the error to done() as the first argument
      }
    }
  )
);

facebookAuthRouter.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["profile"] })
);

facebookAuthRouter.get(
  "/auth/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { failureRedirect: "/auth/fail" })(
      req,
      res,
      next
    );
  },
  (req, res) => {
    console.log(req.user, req.isAuthenticated());
    res.redirect("/facebook/success");
  }
);

facebookAuthRouter.get("/facebook/logout", (req, res) => {
  req.logout();
  res.send("user is logged out");
});

module.exports = { facebookAuthRouter };
