const router = require('express').Router();
const User = require('../models/user');
const _ = require('lodash');
const {ProjectSubmit} = require('../models/proposals');
var template = require('../server/template');
var upload = require('../server/upload');
const async = require('async');
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


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
router.get('/proposals', (req, res, next) => {
    if(req.user){

        ProjectSubmit.find({'pending': 'true'}).then((projectSubmit)=>{
            
            res.render('main/tables', {title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit, message: req.flash('success')});
            // res.render('proposalList', { title: 'Synergy Proposal List'});
             
         }, (e) => {
             res.status(404).send(e);
         });
        
         

    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
});
router.get('/approved', (req, res, next) => {
    if(req.user){
        ProjectSubmit.find({'approve': 'true'}).then((projectSubmit)=>{
            
            res.render('main/tables', {title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit});
            // res.render('proposalList', { title: 'Synergy Proposal List'});
             
         }, (e) => {
             res.status(404).send(e);
         });
    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
});

router.get('/rejected', (req, res, next) => {
    if(req.user){
        ProjectSubmit.find({'reject': 'true'}).then((projectSubmit)=>{
            
            res.render('main/tables', {title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit});
            // res.render('proposalList', { title: 'Synergy Proposal List'});
             
         }, (e) => {
             res.status(404).send(e);
         });
    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
});

router.get('/:id/postapprove', (req, res, next) => {
    
    ProjectSubmit.findOne({_id : req.params.id}).then((projectSubmit)=>{
        console.log("This is postapprove id " + req.params.id);
            // Update each attribute with any possible attribute that may have been submitted in the body of the request
            // If that attribute isn't in the request body, default back to whatever it was before.
            projectSubmit.approve = true;
            projectSubmit.pending = false;
            

            // Save the updated document back to the database
            projectSubmit.save((err, projectSubmit) => {
                if (err) {
                    return res.status(500).send(err)
                    console.log("update error " + req.params.id);
                }
                req.flash('success', 'Approved');
                res.redirect('/proposals');
            });
         
     });
});

router.get('/:id/postcancel', (req, res, next) => {
    
    ProjectSubmit.findOne({_id : req.params.id}).then((projectSubmit)=>{
        console.log("This is postapprove id " + req.params.id);
            // Update each attribute with any possible attribute that may have been submitted in the body of the request
            // If that attribute isn't in the request body, default back to whatever it was before.
            projectSubmit.reject = true;
            projectSubmit.pending = false;
            

            // Save the updated document back to the database
            projectSubmit.save((err, projectSubmit) => {
                if (err) {
                    return res.status(500).send(err)
                    console.log("update error " + req.params.id);
                }
                req.flash('success', 'Rejected');
                res.redirect('/proposals');
            });
         
     });
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

router.get('/:id', (req, res, next) => {
    
        console.log("object id" + req.params.id);
        var id = req.params.id;
        
        ProjectSubmit.findById(id).then((projectSubmit)=>{
            res.render('main/proposal-des', {title: req.params.projectName, projectSubmit: projectSubmit});
            // res.render('proposalList', { title: 'Synergy Proposal List'});                 
         }, (e) => {
            return res.status(404).send(e);
         });
        
        // if (id.match(/^[0-9a-fA-F]{24}$/)) {
        //    //Yes, it's a valid ObjectId, proceed with `findById` call.
        // }
    
    
});


module.exports = router;