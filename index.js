const express = require('express')
const path = require('path')
const mongodb = require("mongodb")
var bodyParser = require("body-parser")

const PORT = process.env.PORT || 5000
const PUBLIC_PATH = path.join(__dirname, 'public');
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
let db;

// Initialize Server
app = express()
app.use(bodyParser.json());
app.use(express.static(PUBLIC_PATH))

// Views
app.set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')


// Routes
app.get('/', (req, res) => res.render('pages/index'))

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
