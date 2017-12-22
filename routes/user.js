const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const User = require('../models/user');
const mailer = require('../misc/mailer');
const Invite = require('../models/invite');

var value = "hi";

router.route('/signup')
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
             //user.secretToken = req.body.secretToken;          
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

// router.post('/invite-supervisor', (req,res) => {
//     const email = req.body.invite_email;
//     const secretToken = randomstring.generate();
//   //  console.log('Email :',email);

//     //Composing email
//     const html = `Hi there
//     <br/>
//     To get registered please click on the following link.
//     <br/><br/>
//     Token : ${secretToken}
//     <br/><br/>
    
//     <a href="http://localhost:3000/signup/${secretToken}">http://localhost:3000/signup/${secretToken}</a>
    
//     <br/><br/>
//     Have a good day!`;
   
//     //<a href="http://localhost:3000/users/verify/${secretToken}">p</a>

//     mailer.sendEmail('admin@teamfly.com',email,'Please signup through this link',html);
//     req.flash('success','An invitation email sent to '+email);
//     res.redirect('/');

// });

router.post('/invite-supervisor', (req,res) => {
    
    var secretToken = randomstring.generate();
    

    Invite.findOne({email: req.body.invite_email}, function(err, existingUser){
        console.log("inside invite");
        if(existingUser){
            req.flash('errors', 'Already invitation sent');
            res.redirect('/');
        }else{
            var invite = new Invite();
            var email = req.body.invite_email;

            invite.email = email;
            invite.secretToken = secretToken;

            invite.save(function(err){
                
                    if(err) return next(err);
                    //res.redirect('/');
                    //Composing email
                    const html = `Hi there
                    <br/>
                    To get registered please click on the following link.
                    <br/><br/>
                    Token : ${secretToken}
                    <br/><br/>
                    
                    <a href="https://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}">https://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}</a>
                    
                    <br/><br/>
                    Have a good day!`;
                    
                
                  
        
                    mailer.sendEmail('admin@synergy.com',email,'Please signup through this link',html);
                    res.redirect('/');
                
            });
             
        }
    });
                 
    

});


//Forgot password

router.post('/forgot-password', (req,res) => {
    
    User.findOne({email : req.body.emailForgot}).then((user) => {
        console.log(user._id);
        const html = `Hi there
        <br/>
        To reset your password please click on the following link.
        <br/><br/>
        
        
        
        <a href="http://localhost:3000/reset-password/${user._id}">http://localhost:3000/reset-password/${user._id}</a>
        
        <br/><br/>
        Have a good day!`;
        
    
      

        mailer.sendEmail('admin@synergy.com',req.body.emailForgot,'Reset password',html);
        res.redirect('/');
        req.flash('errors', 'Check your email');
    })
  
     

});

//reset password
router.get('/reset-password/:id',(req,res,next) => {
    res.render('accounts/reset-password');
});

router.post('/reset-password/:id', (req,res) => {   

});


module.exports = router;