require("dotenv").config();
var express = require("express");
var session = require("express-session");
var exphbs = require("express-handlebars");

var db = require("./models");
var passport = require("./config/passport");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

//Creating Sessions
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
var routes = require("./controller/controller.js");
app.use(routes);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
    app.listen(PORT, function() {
        console.log(
            "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
            PORT,
            PORT
        );
    });
});

module.exports = app;
