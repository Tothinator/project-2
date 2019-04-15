
var exphbs = require("express-handlebars");

module.exports = function(app) {
    // Load index page
    app.get("/", function(req, res) {
        res.render("index", {
            msg: "Welcome!"
        });
    });

    // Load example page and pass in an example by id
    app.get("/login", function(req, res) {
        //Session exists for the user
        console.log(req.user);
        if (req.user) {
            return res.redirect("/members");
        }

        //Else render the login.handlbars
        res.render("login");


    });


    app.get("/members", isAuthenticated, function(req, res) {

        res.render("members");

    });


    // Render 404 page for any unmatched routes
    app.get("*", function(req, res) {
        res.render("404");
    });
};
