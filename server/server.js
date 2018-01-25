const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const request = require('request');
const async = require('async');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('../config/secret');
var fileUpload = require('express-fileupload');

const sessionStore = new MongoStore({url: config.database, autoReconnect: true});

mongoose.connect(config.database, function(err){
    if(err) console.log(err);
    console.log('Connected to DB');
})

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.use(fileUpload());
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('dev'));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.secret,
    store: sessionStore
}));

const port = process.env.PORT || 3000;

//Passport
app.use(passport.initialize());
app.use(passport.session());

//CookieParser

app.use(cookieParser());

//SocketIO

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: config.secret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept){
    console.log('successful connection to socket.io');
    accept();
}
function onAuthorizeFail(data, message, error, accept){
    if(error)
      throw new Error(message);
    console.log('failed connection to socket.io:', message);
   
    if(error)
      accept(new Error(message));
    // this error will be sent to the user as a special error-package 
    // see: http://socket.io/docs/client-api/#socket > error-object 
}

app.use(flash());
//Local Modules 



app.use( function(req, res, next){
    res.locals.user = req.user;
   // res.locals.success_messages = req.flash('success_messages');
   // res.locals.error_messages = req.flash('error_messages');
    next();
});

const mainroutes = require('../routes/main');
const userroutes = require('../routes/user');

//require('../realtime/io')(io);

app.use(mainroutes);
app.use(userroutes);

http.listen(port, (err) => {
    if(err){
        console.log(err);
    }else{
        console.log("Server is running");
    }
});

module.exports = {app}; 