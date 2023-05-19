var fs = require("fs");
var dataService = require("./data-service.js");
var dataServiceAuth = require("./data-service-auth.js");
var express = require("express");
var multer = require("multer");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var app = express();
var path = require("path");
var static = require("serve-static");
var clientSessions = require("client-sessions");
var HTTP_PORT = process.env.PORT || 8080;
require("dotenv").config();

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

app.use(clientSessions({
    cookieName: "session",
    secret: "web322_a6",
    duration: 30 * 60 * 1000, // 30 minutes
    activeDuration: 15 * 60 * 1000 // 15 minutes
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: true}));

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
            }, 
        equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
        return options.inverse(this);
        } else {
        return options.fn(this);}
        }
    }
}));

app.set('view engine', '.hbs');

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

var storage = multer.diskStorage({
    destination: "./public/images/uploaded", filename: function (req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage });
////////////////////////////////////////////////////////
app.get("/", function(req, res){
    res.render("home");
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/images", ensureLogin, (req, res) => {
    fs.readdir("./public/images/uploaded", function(err, imageFile){
        res.render("images",{"images": imageFile});
    });
});

app.get("/images/add", ensureLogin, (req,res) => {
    res.render("addImage"); 
}); 

app.get("/articles", function(req, res){
    dataService.getArticles()
    .then((data) => {
        if (data.length > 0) {
            console.log(data[0].articleTitle);
            res.render("articles", {articles: data});
        }
        else{
            res.render("articles", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("articles", {message: "unable to get articles"});
    })
});

app.get("/articles/add", ensureLogin, function(req, res) {
    res.render("addArticle");
})

app.get("/article/:articleId", ensureLogin, (req, res) => {
    dataService.getUpdateArticleById(req.params.articleId)
    .then((data) => {
        if (data) {
            res.render("updateArticle", {
                article: data
            });
        }
        else{
            res.status(404).send("Article Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("Article Not Found");
    });
});

app.get("/article/reading/:articleId", function(req, res){
    dataService.getArticleById(req.params.articleId)
    .then((data) => {
        if (data) {
            res.render("articleReading", {
                article: data
            });
        }
        else{
            res.status(404).send("Article Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("Article Not Found");
    });
});

app.get("/articles/delete/:articleId", ensureLogin, (req, res) => {
    dataService.deleteArticleById(req.params.articleId)
        .then(() => {
            res.redirect("/articles");
        }).catch(() => {
            res.status(500).send("Unable to Remove Article / Article not found");
        });
});
////////////////////////////////////////////////////////
app.post("/articles/add", ensureLogin, (req, res) => {
    dataService.addArticle(req.body)
    .then(() => {
        res.redirect("/articles");
    })
    .catch(() => {
        res.status(500).send("unable to add article");
    });
});

app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
    res.redirect("/images");
});

app.post("/article/update", ensureLogin, (req, res) => {
    dataService.updateArticle(req.body)
    .then(() => {
        res.redirect("/articles");
    })
    .catch(() => {
        res.status(500).send("unable to update article");
    });
});
////////////////////////////////////////////////////////
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body)
    .then(() => {
        res.render("register", {successMessage: "User created"});
    })
    .catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName});
    });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email, // authenticated user's email
            loginHistory: user.loginHistory // authenticated user's loginHistory
        }
        res.redirect('/');
    })
    .catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.use((req, res) => {
    res.status(404).send("Page Not Found!");
});

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(() => {
    console.log("start the server");
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(err => {
    console.log("unable to start server: " +err);
});