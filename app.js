const express = require('express');

const path = require('path');

const mongoose = require('mongoose');

const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

mongoose.connect(config.database);

let db = mongoose.connection;


//check connection
db.once('open', function(){
    console.log('connected to mongodb');
});

//check for db errors
db.on('error', function(err){
    console.log(err);
});

//initialize the app
const app = express();

//require the model
let Article = require('./models/article');

//load the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//static folder
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));


//express connect flash for flash messages
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });

//Express validator
app.use(expressValidator({
    errorformatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            value : value
        };
    }
}));

//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res,next){
    res.locals.user = req.user || null;
    next();
});

//home route
app.get('/', function(req, res){
    Article .find({}, function(err, articles){
        if(err){
            console.log(err);
        }else {
            res.render('index', {
                input: 'My Articles',
                articles: articles
            });
        }        
    });
});


// use the route file for anything going to /article
let article = require('./routes/article');
let user = require('./routes/user')
app.use('/article', article);
app.use('/user', user);

//start the server
app.listen(3000, function(){
    console.log('server started on port 3000....');
});