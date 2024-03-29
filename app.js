require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const _ = require('lodash')
const mongoose = require('mongoose')
// const bcrypt = require('bcrypt');
// const saltRounds = 3;
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const findOrCreate = require('mongoose-findorcreate')

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(
	session({
		secret: 'Always stick to fidelity.',
		resave: false,
		saveUninitialized: false,
	}),
)

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(
	'mongodb+srv://admin-justfidel:Password123@cluster0.30p6n62.mongodb.net/userDB',
)

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	googleId: String,
	secret: String,
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(function (user, done) {
	done(null, user.id)
})

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user)
	})
})

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: 'https://jf-secret-app.onrender.com/auth/google/secrets',
		},
		function (accessToken, refreshToken, profile, cb) {
			User.findOrCreate({ googleId: profile.id }, function (err, user) {
				return cb(err, user)
			})
		},
	),
)

app.get('/', (req, res) => {
	res.render('home')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get(
	'/auth/google/secrets',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect('/secrets')
	},
)

app.get('/login', (req, res) => {
	res.render('login')
})

app.get('/register', (req, res) => {
	res.render('register')
})

app.get('/secrets', (req, res) => {
	User.find({ secret: { $ne: null } }, (err, foundUsers) => {
		if (err) {
			console.log(err)
		} else {
			if (foundUsers) {
				res.render('secrets', {
					usersWithSecrets: foundUsers,
				})
			}
		}
	})
})

app.get('/submit', (req, res) => {
	res.set(
		'Cache-Control',
		'no-cache, private, no-store, must-revalidate, max-stal   e=0, post-check=0, pre-check=0',
	)

	if (req.isAuthenticated()) {
		res.render('submit')
	} else {
		res.redirect('/login')
	}
})

app.post('/submit', (req, res) => {
	const submittedSecret = req.body.secret

	User.findById(req.user.id, (err, foundUser) => {
		if (err) {
			console.log(err)
		} else {
			if (foundUser) {
				foundUser.secret = submittedSecret
				foundUser.save(() => {
					res.redirect('/secrets')
				})
			}
		}
	})
})

app.get('/logout', (req, res) => {
	req.logout(err => {
		if (err) {
			console.log(err)
		} else {
			res.redirect('/')
		}
	})
})

app.post('/register', (req, res) => {
	User.register(
		{ username: req.body.username },
		req.body.password,
		(err, user) => {
			if (err) {
				console.log(err)
				res.redirect('/register')
			} else {
				passport.authenticate('local')(req, res, () => {
					res.redirect('/secrets')
				})
			}
		},
	)
})

app.post('/login', (req, res) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
	})

	req.login(user, err => {
		if (err) {
			console.log(err)
		} else {
			passport.authenticate('local')(req, res, () => {
				res.redirect('/secrets')
			})
		}
	})
})

app.listen(process.env.POST || 3000, () => {
	console.log('Server has started Successfully!!!')
})
