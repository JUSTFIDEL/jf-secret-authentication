require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 3;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-justfidel:Password123@cluster0.30p6n62.mongodb.net/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home')
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.get('/register', (req, res) => {
  res.render('register')
});

app.post('/register', (req, res) => {

  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    
    const newUser = new User({
      email: req.body.username,
      password: hash
    })

    newUser.save((err) => {
      if (!err) {
        res.render('secrets')
      } else {
        console,log(err)
      }
    });
  })
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, (err, foundUser) => {
    if (err) { 
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, (err, result) => {
          if (result === true) {
            res.render('secrets')
          }    
        });
      }
    }
  })
})





app.listen(process.env.POST || 3000, function() {
  console.log("Server has started Successfully!!!");
});
