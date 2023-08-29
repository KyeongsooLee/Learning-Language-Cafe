var fs = require("fs");
// var dataService = require("./data-service.js");
var dataServiceAuth = require("./data-service-auth.js");
var dataServiceArticles  = require("./controllers/articleController.js");
var dataServiceRecords = require("./controllers/recordController.js");
var dataServiceShortStories = require("./controllers/shortStoryController.js");
var dataServiceIeltsSpeaking = require("./controllers/ieltsSpeaking.js");
var dataServiceIndex = require("./models/index.js");
const { formatDate } = require('./helpers/utility');
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
    dataServiceArticles.getArticles()
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
            viewData.level = req.session.user.level;
            viewData.exp = req.session.user.exp;
        }
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
    dataServiceArticles.getUpdateArticleById(req.params.articleId)
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
    dataServiceArticles.getArticleById(req.params.articleId)
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
    dataServiceArticles.deleteArticleById(req.params.articleId)
        .then(() => {
            res.redirect("/articles");
        }).catch(() => {
            res.status(500).send("Unable to Remove Article / Article not found");
        });
});

app.get("/shortstories", function(req, res){
    let viewData = {};
    dataServiceShortStories.getShortStories()
    .then((data) => {
        viewData.shortStories = data;
        
        if (req.session.user) {
            viewData.finishReadingShortStories = req.session.user.finishReadingShortStories;
            viewData.favoriteShortStories = req.session.user.favoriteShortStories;
            for (let i = 0; i < viewData.shortStories.length; i++) {
                for (let j = 0; j < viewData.finishReadingShortStories.length; j++) {
                    if (viewData.shortStories[i].shortStoryId == viewData.finishReadingShortStories[j]) {
                        viewData.shortStories[i].selected = true;
                    }
                }
                for (let j = 0; j < viewData.favoriteShortStories.length; j++) {
                    if (viewData.shortStories[i].shortStoryId == viewData.favoriteShortStories[j]) {
                        viewData.shortStories[i].liked = true;
                    }
                }
            }
            viewData.level = req.session.user.level;
            viewData.exp = req.session.user.exp;
        }
        if (viewData.shortStories.length > 0) {
            res.render("shortstories", {viewData: viewData});
        }
        else{
            res.render("shortstories", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("shortstories", {message: "unable to get shortStories"});
    })
});

app.get("/shortstory/add", ensureLogin, function(req, res) {
    res.render("addShortStory");
});

app.get("/shortstory/reading/:shortStoryId", function(req, res){
    let viewData = {};
    dataServiceShortStories.getShortStoryById(req.params.shortStoryId)
    .then((data) => {
        viewData.shortStory = data;
        if (req.session.user) {
            viewData.finishReadingShortStories = req.session.user.finishReadingShortStories;
            viewData.favoriteShortStories = req.session.user.favoriteShortStories;
            for (let j = 0; j < viewData.finishReadingShortStories.length; j++) {
                if (viewData.shortStory.shortStoryId == viewData.finishReadingShortStories[j]) {
                    viewData.shortStory.selected = true;
                }
            }
            for (let j = 0; j < viewData.favoriteShortStories.length; j++) {
                if (viewData.shortStory.shortStoryId == viewData.favoriteShortStories[j]) {
                    viewData.shortStory.liked = true;
                }
            }
        }
        if (data) {
            res.render("shortStoryReading", {
                viewData: viewData
            });
        }
        else{
            res.status(404).send("Short Story Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("Short Story Not Found");
    });
});

app.get("/shortstory/:shortStoryId", ensureLogin, (req, res) => {
    dataServiceShortStories.getUpdateShortStoryById(req.params.shortStoryId)
    .then((data) => {
        if (data) {
            res.render("updateShortStory", {
                shortStory: data
            });
        }
        else{
            res.status(404).send("Short Story Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("Short Story Not Found");
    });
});

app.get("/shortstory/delete/:shortStoryId", ensureLogin, (req, res) => {
    dataServiceShortStories.deleteShortStory(req.params.shortStoryId)
        .then(() => {
            res.redirect("/shortstories");
        }).catch(() => {
            res.status(500).send("Unable to Remove Short Story / Short Story not found");
        });
});

app.get("/dailyrecord", function(req, res){
    let viewData = {};
    dataServiceRecords.getRecords()
    .then((data) => {
        viewData.records = data;
        for(let i = 0; i < viewData.records.length ; i++) {
            const date = new Date(viewData.records[i].createdAt)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedCreatedAt = `${year}/${month}/${day}`;
            viewData.records[i].createdAt = formattedCreatedAt;
        }
        if (viewData.records.length > 0) {
            res.render("dailyrecord", {viewData: viewData});
        }
        else{
            res.render("dailyrecord", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("dailyrecord", {message: "unable to get dailyrecord"});
    })
});

app.get("/dailyrecord/add", ensureLogin, function(req, res) {
    res.render("addRecord");
})

app.get("/record/reading/:recordId", function(req, res){
    let viewData = {};
    dataServiceRecords.getRecordById(req.params.recordId)
    .then((data) => {
        viewData.record = data;
        if (data) {
            res.render("recordReading", {
                viewData: viewData
            });
        }
        else{
            res.status(404).send("Record Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("Record Not Found");
    });
});

app.get("/record/:recordId", ensureLogin, (req, res) => {
    dataServiceRecords.getUpdateRecordById(req.params.recordId)
    .then((data) => {
        if (data) {
            res.render("updateRecord", {
                record: data
            });
        }
        else{
            res.status(404).send("Record Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("Record Not Found");
    });
});

app.get("/record/delete/:recordId", ensureLogin, (req, res) => {
    dataServiceRecords.deleteRecordById(req.params.recordId)
        .then(() => {
            res.redirect("/dailyrecord");
        }).catch(() => {
            res.status(500).send("Unable to Remove Record / Record not found");
        });
});

app.get("/ieltsSpeaking", function(req, res){
    let viewData = {};
    dataServiceIeltsSpeaking.getIeltsSpeaking()
    .then((data) => {
        viewData.ieltsSpeakings = data;
        for(let i = 0; i < viewData.ieltsSpeakings.length ; i++) {
            const date = new Date(viewData.ieltsSpeakings[i].createdAt)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedCreatedAt = `${year}/${month}/${day}`;
            viewData.ieltsSpeakings[i].createdAt = formattedCreatedAt;
        }
        if (viewData.ieltsSpeakings.length > 0) {
            res.render("ieltsSpeaking", {viewData: viewData});
        }
        else{
            res.render("ieltsSpeaking", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("ieltsSpeaking", {message: "unable to get ieltsSpeaking"});
    })
});

app.get("/ieltsSpeaking/add", ensureLogin, function(req, res) {
    res.render("addIeltsSpeaking");
})

app.get("/ieltsSpeaking/reading/:ieltsSpeakingId", function(req, res){
    let viewData = {};
    dataServiceIeltsSpeaking.getIeltsSpeakingById(req.params.ieltsSpeakingId)
    .then((data) => {
        viewData.ieltsSpeakings = data;
        if (data) {
            res.render("ieltsSpeakingReading", {
                viewData: viewData
            });
        }
        else{
            res.status(404).send("ieltsSpeaking Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("ieltsSpeaking Not Found");
    });
});

app.get("/ieltsSpeaking/:ieltsSpeakingId", ensureLogin, (req, res) => {
    dataServiceIeltsSpeaking.getUpdateIeltsSpeakingById(req.params.ieltsSpeakingId)
    .then((data) => {
        if (data) {
            res.render("updateIeltsSpeaking", {
                ieltsSpeaking: data
            });
        }
        else{
            res.status(404).send("IeltsSpeaking Not Found");
        }
    })
    .catch(() => {
        res.status(404).send("IeltsSpeaking Not Found");
    });
});

app.get("/ieltsSpeaking/delete/:ieltsSpeakingId", ensureLogin, (req, res) => {
    dataServiceIeltsSpeaking.deleteIeltsSpeaking(req.params.ieltsSpeakingId)
        .then(() => {
            res.redirect("/updateIeltsSpeaking");
        }).catch(() => {
            res.status(500).send("Unable to Remove Ielts Speaking / Ielts Speaking not found");
        });
});

////////////////////////////////////////////////////////
app.post("/articles/add", ensureLogin, (req, res) => {
    dataServiceArticles.addArticle(req.body)
    .then(() => {
        res.redirect("/articles");
    })
    .catch(() => {
        res.status(500).send("unable to add article");
    });
});

app.post("/shortStory/add", ensureLogin, (req, res) => {
    dataServiceShortStories.addShortStory(req.body)
    .then(() => {
        res.redirect("/shortstories");
    })
    .catch(() => {
        res.status(500).send("unable to add Short Story");
    });
});

app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
    res.redirect("/images");
});

app.post("/article/update", ensureLogin, (req, res) => {
    dataServiceArticles.updateArticle(req.body)
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

app.post("/shortStory/action/:shortStoryId", ensureLogin, (req, res) => {
    const action = req.body.action;
    console.log(`Call ${action}!`);

    let promise;
    if (action === 'markAsRead') {
        promise = dataServiceAuth.updateMarkAsReadShortStory(req.params.shortStoryId, req.session.user);
    } else if (action === 'like') {
        promise = dataServiceAuth.updateLikeShortStory(req.params.shortStoryId, req.session.user);
    } else {
        return res.status(400).send("Unknown action");
    }

    promise
        .then(() => {
            res.redirect(`/shortstory/reading/${req.params.shortStoryId}`);
        })
        .catch(() => {
            res.status(500).send("Unable to update Short Story");
        });
});

app.post("/shortStory/update", ensureLogin, (req, res) => {
    dataServiceShortStories.updateShortStory(req.body)
    .then(() => {
        res.redirect("/shortstories");
    })
    .catch(() => {
        res.status(500).send("unable to update short story");
    });
});

app.post("/records/add", ensureLogin, (req, res) => {
    dataServiceRecords.addRecord(req.body, req.session.user)
    .then(() => {
        res.redirect("/dailyrecord");
    })
    .catch(() => {
        res.status(500).send("unable to add record");
    });
});

app.post("/record/update", ensureLogin, (req, res) => {
    dataServiceRecords.updateRecord(req.body)
    .then(() => {
        res.redirect("/dailyrecord");
    })
    .catch(() => {
        res.status(500).send("unable to update record");
    });
});

app.post("/ieltsSpeakings/add", ensureLogin, (req, res) => {
    dataServiceIeltsSpeaking.addIeltsSpeaking(req.body, req.session.user)
    .then(() => {
        res.redirect("/ieltsSpeaking");
    })
    .catch(() => {
        res.status(500).send("unable to add ieltsSpeaking");
    });
});

app.post("/ieltsSpeakings/update", ensureLogin, (req, res) => {
    dataServiceIeltsSpeaking.updateIeltsSpeaking(req.body)
    .then(() => {
        res.redirect("/ieltsSpeaking");
    })
    .catch(() => {
        res.status(500).send("unable to update ieltsSpeaking");
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
            readShortStoryCount: user.readShortStoryCount,
            finishReadingArticles: user.finishReadingArticles,
            favoriteArticles: user.favoriteArticles,
            finishReadingShortStories: user.finishReadingShortStories,
            favoriteShortStories: user.favoriteShortStories,
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

app.get("/userReadList", ensureLogin, (req, res) => {
    let viewData = {};

    Promise.all([dataServiceArticles.getArticles(), dataServiceShortStories.getShortStories()]) 
    .then(([articlesData, shortStoriesData]) => {
        viewData.articles = articlesData;
        viewData.shortStories = shortStoriesData;

        if (req.session.user) {
            viewData.finishReadingArticles = req.session.user.finishReadingArticles;
            viewData.favoriteArticles = req.session.user.favoriteArticles;
            viewData.finishReadingShortStories = req.session.user.finishReadingShortStories;
            viewData.favoriteShortStories = req.session.user.favoriteShortStories;

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

            for (let i = 0; i < viewData.shortStories.length; i++) {
                for (let j = 0; j < viewData.finishReadingShortStories.length; j++) {
                    if (viewData.shortStories[i].shortStoryId == viewData.finishReadingShortStories[j]) {
                        viewData.shortStories[i].selected = true;
                    }
                }
                for (let j = 0; j < viewData.favoriteShortStories.length; j++) {
                    if (viewData.shortStories[i].shortStoryId == viewData.favoriteShortStories[j]) {
                        viewData.shortStories[i].liked = true;
                    }
                }
            }

            viewData.level = req.session.user.level;
            viewData.exp = req.session.user.exp;
        }

        if (viewData.articles.length > 0 || viewData.shortStories.length > 0) {
            res.render("userReadList", {viewData: viewData});
        } else {
            res.render("userReadList", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("userReadList", {message: "unable to get articles or short stories"});
    })
});

app.get("/userHistory", ensureLogin, (req, res) => {
    if (req.session && req.session.user && req.session.user.loginHistory) {
        req.session.user.loginHistory.forEach(history => {
            history.dateTime = formatDate(history.dateTime);
        });
    }
    res.render("userHistory", { session: req.session });
    // res.render("userHistory");
});

app.use((req, res) => {
    res.status(404).send("Page Not Found!");
});

dataServiceIndex.initialize()
.then(dataServiceAuth.initialize)
.then(() => {
    console.log("start the server");
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(err => {
    console.log("unable to start server: " +err);
});