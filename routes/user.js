const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const User = require('../models/user');
const mailer = require('../misc/mailer');
const Invite = require('../models/invite');
var async = require('async');
var crypto = require('crypto');

var value = "hi";

router.route('/signup')
    .get( (req, res, next) => {
        res.render('accounts/signup', {errorMessage : req.flash('errors')});
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




router.get('/user-logout', (req,res, next) => {
    req.logout();
    res.redirect('/');
});



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
                    // const html = `Hi there
                    // <br/>
                    // To get registered please click on the following link.
                    // <br/><br/>
                    // Token : ${secretToken}
                    // <br/><br/>
                    
                    // <a href="https://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}">https://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}</a>
                    
                    // <br/><br/>
                    // Have a good day!`;
                    const html = 'Hi there,\n\n\n' +
                    'This is a supervisor invitation from CSE department of Leading University to supervise third year and final year project.\n\n' +
                    'To register as a supervisor please go through the following link.\n\n' +
                    'http://'+'s-supervisor'+'/signup-supervisor/' + secretToken + '\n\n\n' +
                                        
                    'Have a good day!\n\n\n\n\n' +
                    'Regards,\n' +
                    'Minhazul Haque Riad\n' +
                    'Senior Lecturer and Project Convenor\n' +
                    'CSE deapartment,Leading University,Sylhet';
                    
                
                  
        
                    mailer.sendEmail('admin@synergy.com',email,'Please signup through this link',html);
                    req.flash('success', 'Invitation sent');
                    res.redirect('/');
                
            });
             
        }
    });
                 
    

});


//Forgot password



router.post('/forgot-password', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.emailForgot }, function(err, user) {
          if (!user) {
            req.flash('errors', 'No account with that email address exists.');
            return res.redirect('/');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        const html = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n';
        
    
      

        mailer.sendEmail('admin@synergy.com',req.body.emailForgot,'Reset password',html);
       
        req.flash('success', 'A reset-password mail has been sent to your email address.Check it out!');
        res.redirect('/');

        
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });

//reset password


router.get('/reset-password/:token', function(req, res) {
     User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    //User.findOne({resetPasswordToken:req.params.token}, function(err, user) {
        
      if (!user) {
        req.flash('errors', 'No user with this email');
       // console.log("inside reset password get");
        return res.redirect('/');
      }
      res.render('accounts/reset-password', {
        user: user
      });
   
    });
  });
router.post('/reset-password/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      //  User.findOne({resetPasswordToken: req.params.token}, function(err, user) {
          if (!user) {
            req.flash('errors', 'Password reset token is invalid or has expired.');
            return res.redirect('/');
          }
  
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
  
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        const html = 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        
        mailer.sendEmail('admin@synergy.com',user.email,'Password change confirmation',html);
        res.redirect('/');
        
      }
    ], function(err) {
      res.redirect('/');
    });
  });




module.exports = router;