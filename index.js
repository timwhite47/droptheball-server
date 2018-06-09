const express = require('express')
const path = require('path')
const mongodb = require("mongodb")
const passport = require("passport")
const bodyParser = require("body-parser")
const session = require('express-session')
const bcrypt = require('bcrypt')
const flash = require('express-flash');
const SECRET = '$2b$10$q82MVIfgk2vREjzYron5vO';
const LocalStrategy = require('passport-local').Strategy;
const PORT = process.env.PORT || 5000
const USERS_COLLECTION = 'users';
const PUBLIC_PATH = path.join(__dirname, 'public');
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/droptheball";
let db;
const sessionStore = new session.MemoryStore;
const FacebookStrategy = require('passport-facebook').Strategy
const FACEBOOK_APP_ID = "138184660387306"
const FACEBOOK_APP_SECRET = "862c5fe516e57b76146af1dc8516fd94"


// Initialize Server
app = express()
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(PUBLIC_PATH))
app.use(flash());
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: SECRET
}));

// Views
app.set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Authentication
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log("serializing user", user);
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  console.log("Deserializing user", email);
  db.collection(USERS_COLLECTION).findOne({email: email},(err, user) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },(email, password, done) => {
    db.collection(USERS_COLLECTION).findOne({email: email}, (err, user) => {
      if (err) { return done(err); }

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      bcrypt.hash(password, SECRET, (err, hash) => {

        if(hash == user.password_hash) {
         return done(null, user);
        } else {
         return done(null, false, { message: 'Incorrect password.' });
        }
      })
    })
  }
));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "https://droptheball.herokuapp.com/auth/facebook/callback"
  }, (accessToken, refreshToken, profile, done) => {
    db.collection(USERS_COLLECTION).findOne({email: profile.email}, (err, user) => {
      if (err) { return done(err); }

      if (user) {
        return done(null, user);
      } else {
        db.collection(USERS_COLLECTION).insert(profile, (err, res) => {
          return done(err, res)
        })
      }
    })
  }
));

// Routes
app.get('/', (req, res) => res.render('pages/index'))
app.get('/signup', (req, res) => res.render('pages/signup'))
app.get('/login', (req, res) => {
  return res.render('pages/login')
})

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'email']}));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);

app.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, SECRET, (err, password_hash) => {
    db.collection(USERS_COLLECTION).insert({
      email: req.body.email,
      password_hash: password_hash
    })
    req.login({email: req.body.email}, function(err) {
      if (err) { return next(err); }

      return res.redirect('/');
    });
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login#failure',
}));

// Connect DB/Start server
mongodb.MongoClient.connect(MONGO_URI, (err, client) => {
  if (err) {
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();

  // Initialize the app.
  let server = app.listen(PORT, function () {
    let port = server.address().port;
  });
});
