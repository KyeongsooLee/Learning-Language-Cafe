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
    console.log("Express http server listening on http://localhost:" + HTTP_PORT);
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
    let viewData = {};
    dataService.getArticles()
    .then((data) => {
        viewData.articles = data;
        if (req.session.user) {
            viewData.finishReadingArticles = req.session.user.finishReadingArticles;
            viewData.favoriteArticles = req.session.user.favoriteArticles;
            for (let i = 0; i < viewData.articles.length; i++) {
                for (let j = 0; j < viewData.finishReadingArticles.length; j++) {
                    if (viewData.articles[i].articleId == viewData.finishReadingArticles[j]) {
                        viewData.articles[i].selected = true;
                    }
                }
                for (let j = 0; j < viewData.favoriteArticles.length; j++) {
                    if (viewData.articles[i].articleId == viewData.favoriteArticles[j]) {
                        viewData.articles[i].liked = true;
                    }
                }
            }
        }
        viewData.level = req.session.user.level;
        viewData.exp = req.session.user.exp;
        if (viewData.articles.length > 0) {
            res.render("articles", {viewData: viewData});
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
    let viewData = {};
    dataService.getArticleById(req.params.articleId)
    .then((data) => {
        viewData.article = data;
        if (req.session.user) {
            viewData.finishReadingArticles = req.session.user.finishReadingArticles;
            viewData.favoriteArticles = req.session.user.favoriteArticles;
            for (let j = 0; j < viewData.finishReadingArticles.length; j++) {
                if (viewData.article.articleId == viewData.finishReadingArticles[j]) {
                    viewData.article.selected = true;
                }
            }
            for (let j = 0; j < viewData.favoriteArticles.length; j++) {
                if (viewData.article.articleId == viewData.favoriteArticles[j]) {
                    viewData.article.liked = true;
                }
            }
        }
        if (data) {
            res.render("articleReading", {
                viewData: viewData
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

// app.post("/article/markAsRead/:articleId", ensureLogin, (req, res) => {
//     console.log("Call MarkAsRead");
//     dataServiceAuth.updateMarkAsReadArticle(req.params.articleId, req.session.user)
//     .then(() => {
//         res.redirect(`/article/reading/${req.params.articleId}`);
//     })
//     .catch(() => {
//         res.status(500).send("unable to update article");
//     });
// });

// app.post("/article/like/:articleId", ensureLogin, (req, res) => {
//     console.log("Call Like!");
//     dataServiceAuth.updateLikeArticle(req.params.articleId, req.session.user)
//     .then(() => {
//         res.redirect(`/article/reading/${req.params.articleId}`);
//     })
//     .catch(() => {
//         res.status(500).send("unable to update article");
//     });
// });

app.post("/article/action/:articleId", ensureLogin, (req, res) => {
    const action = req.body.action;
    console.log(`Call ${action}!`);

    let promise;
    if (action === 'markAsRead') {
        promise = dataServiceAuth.updateMarkAsReadArticle(req.params.articleId, req.session.user);
    } else if (action === 'like') {
        promise = dataServiceAuth.updateLikeArticle(req.params.articleId, req.session.user);
    } else {
        return res.status(400).send("Unknown action");
    }

    promise
        .then(() => {
            res.redirect(`/article/reading/${req.params.articleId}`);
        })
        .catch(() => {
            res.status(500).send("Unable to update article");
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
            loginHistory: user.loginHistory, // authenticated user's loginHistory     
            readArticleCount: user.readArticleCount,
            finishReadingArticles: user.finishReadingArticles,
            favoriteArticles: user.favoriteArticles,
            level: user.level,
            exp: user.exp,
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