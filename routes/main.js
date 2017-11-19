const router = require('express').Router();
const User = require('../models/user');
const {ProjectSubmit} = require('../models/proposals');
var template = require('../server/template');
var upload = require('../server/upload');
const async = require('async');


router.get('/', (req, res, next) => {
    if(req.user){
        ProjectSubmit.find().then((projectSubmit)=>{
            
            res.render('main/index', {title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit});
            // res.render('proposalList', { title: 'Synergy Proposal List'});
             
         }, (e) => {
             res.status(404).send(e);
         });

    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
    
});
router.get('/tables', (req, res, next) => {
    if(req.user){

        ProjectSubmit.find().then((projectSubmit)=>{
            
            res.render('main/tables', {title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit});
            // res.render('proposalList', { title: 'Synergy Proposal List'});
             
         }, (e) => {
             res.status(404).send(e);
         });
        
         

    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
});

router.get('/registered_user', (req, res, next) => {
    if(req.user){
        res.render('main/registered_user', {title: 'Synergy - Admin Dashboard'});
    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
});

router.get('/template', template.get);

router.post('/registered_user', upload.post);

router.get('/user/:id', (req, res, next) => {
    async.waterfall([
        function(callback){
            Tweet.find({ owner: req.params.id})
                .populate('owner')
                .exec(function(err, tweets){
                    callback(err, tweets);
                });
        },
        function(tweets, callback){
             User.findOne({_id: req.params.id})
                .populate('following')
                .populate('followers')
                .exec(function(err, user){
                    var follower = user.followers.some(function(friend){
                        return friend.equals(req.user._id);
                    });
                    var currentUser;
                    if(req.user._id.equals(user._id)){
                        currentUser = true;
                    }else{
                        currentUser = false;
                    }
                    res.render('main/user', { foundUser: user, tweets: tweets, currentUser: currentUser, follower: follower});
                });
        }
    ]);
});


module.exports = router;