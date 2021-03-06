const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    User.findOne({username: username}, function(err, user){

        if(err) return done(err);
        if(!user)
        {
            console.log('No such user');
            return done(null, false, req.flash('errors', 'Opss! No user found.'));
           // return done(null, false, req.flash('error_messages', 'Opss! No user found.'));
            
        }
        //return done(null,false, {message:'Opss! No user found.'}); 
        
        if(!user.comparePassword(password)) 
        {
             //return done(null,false, {message:'Opss! Wrong password.'});
             console.log('wrong password');
             return done(null, false, req.flash('errors', 'Opss! Wrong password.'));
            //return done(null, false, req.flash('error_messages', 'Opss! Wrong password.'));
        }
       

        return done(null, user);
    });
}));