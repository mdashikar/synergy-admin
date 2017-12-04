const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const User = require('../models/user');
const mailer = require('../misc/mailer');

router.route('/signup/:secretToken')
    .get( (req, res, next) => {
        res.render('accounts/signup', {message : req.flash('errors')});
    })
    .post((req, res, next) => 
    {
       User.findOne({email: req.body.email}, function(err, existingUser){
           if(existingUser){
               req.flash('errors', 'Email address already exists try different one!!');
               res.redirect('/signup');
               console.log("In db save body");
           }
           
           else{
                var user = new User();
                user.name = req.body.name;
                user.email = req.body.email;
                user.username = req.body.username;
                user.password = req.body.password;  
                user.secretToken = req.body.secretToken;            
                user.save(function(err){
                    // req.logIn(user, function(err){
                        if(err) return next(err);
                        res.redirect('/');
                    // });
                });
           }
       });
       User.findOne({username: req.body.username}, function(err, existingUser){
        if(existingUser){
            req.flash('errors', 'Username already exists try different one!!');
            res.redirect('/signup');
        }else{
             var user = new User();
             user.name = req.body.name;
             user.email = req.body.email;
             user.username = req.body.username;
             user.password = req.body.password;    
             user.secretToken = req.body.secretToken;          
             user.save(function(err){
                 // req.logIn(user, function(err){
                     if(err) return next(err);
                     res.redirect('/');
                 // });
             });
        }
    });
    User.findOne({secretToken: req.body.secretToken}, function(err, existingUser){
        if(existingUser){
            req.flash('errors', 'You are not eligible to register here');
            res.redirect('/signup');
        }else{
             var user = new User();
             user.name = req.body.name;
             user.email = req.body.email;
             user.username = req.body.username;
             user.password = req.body.password;  
             user.secretToken = req.body.secretToken;            
             user.save(function(err){
                 // req.logIn(user, function(err){
                     if(err) return next(err);
                     res.redirect('/');
                 // });
             });
        }
    });

    });

router.route('/')
    .get( (req, res, next) => {
        if(req.user) res.redirect('/');
        res.render('accounts/login', {message: req.flash('loginMessage')});
    })
    .post(passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

router.get('/user-logout', (req,res, next) => {
    req.logout();
    res.redirect('/');
});

//Invite students

router.post('/invite-supervisor', (req,res) => {
    const email = req.body.invite_email;
    const secretToken = randomstring.generate();
  //  console.log('Email :',email);

    //Composing email
    const html = `Hi there
    <br/>
    To get registered please click on the following link and paste your secret token for registration.
    <br/><br/>
    Token : ${secretToken}
    <br/><br/>
    
    <a href="http://localhost:3000/signup/${secretToken}">http://localhost:3000/signup/${secretToken}</a>
    
    <br/><br/>
    Have a good day!`;
   
    //<a href="http://localhost:3000/users/verify/${secretToken}">p</a>

    mailer.sendEmail('admin@teamfly.com',email,'Please signup through this link',html);
    req.flash('success','An invitation email sent to '+email);
    res.redirect('/');

});

module.exports = router;