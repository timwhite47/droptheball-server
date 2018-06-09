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
  console.log('Serializing User');
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  console.log("Deserializing User");
  db.collection(USERS_COLLECTION).findOne({email: email},(err, user) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },(email, password, done) => {
  console.log(email, password);
    db.collection(USERS_COLLECTION).findOne({email: email}, (err, user) => {
      console.log(err, user);
      if (err) { return done(err); }

      if (!user) {
        console.log("Incorrect email");
        return done(null, false, { message: 'Incorrect email.' });
      }
      bcrypt.hash(password, SECRET, (err, hash) => {
        console.log(hash, user.password_hash);

        if(hash == user.password_hash) {
          console.log('Correct PW');
         return done(null, user);
        } else {
          console.log('Incorrect PW');
         return done(null, false, { message: 'Incorrect password.' });
        }
      })
    })
  }
));

// Routes
app.get('/', (req, res) => res.render('pages/index'))
app.get('/signup', (req, res) => res.render('pages/signup'))
app.get('/login', (req, res) => {
  console.log(req.flash('error'));
  return res.render('pages/login')

})

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
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  let server = app.listen(PORT, function () {
    let port = server.address().port;
    console.log("App now running on port", port);
  });
});
