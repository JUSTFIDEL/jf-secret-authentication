require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 3;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'Always stick to fidelity.',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-justfidel:Password123@cluster0.30p6n62.mongodb.net/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render('home')
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.get('/register', (req, res) => {
  res.render('register')
});

app.get('/secrets', (req, res) => {

  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stal   e=0, post-check=0, pre-check=0');
  
  if (req.isAuthenticated()) {
    res.render('secrets')
  } else {
    res.redirect('/')
  }
});

app.get('/logout', (req, res) => {
  
  req.logout((err) => {
    if (err) { 
      console.log(err); 
    } else {
      res.redirect('/');
    }
  });
  
});

app.post('/register', (req, res) => {

  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })

});

app.post('/login', (req, res) => {

  const user = new User ({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })

})





app.listen(process.env.POST || 3000, function() {
  console.log("Server has started Successfully!!!");
});


//