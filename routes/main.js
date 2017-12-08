//import { ObjectID } from './C:/Users/Test/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/bson';

const router = require('express').Router();
const User = require('../models/user');
const Supervisor = require('../models/supervisor');
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



router.get('/registered_user', (req, res, next) => {
    if(req.user){
        res.render('main/registered_user', {title: 'Synergy - Admin Dashboard'});
    }else{
        res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
    }
});




router.get('/template', template.get);

router.post('/registered_user', upload.post);

router.get('/proposals/:id', (req, res, next) => {
    
        console.log("object id" + req.params.id);
        var id = req.params.id;
        
        ProjectSubmit.findById(id).then((projectSubmit)=>{
            //res.render('main/proposal-des', {title: req.params.projectName, projectSubmit: projectSubmit});
            Supervisor.find({}).then((supervisor) =>{
                res.render('main/proposal-des', {title: 'Synergy - Admin Dashboard',projectSubmit: projectSubmit, supervisor: supervisor});        
            });
            // res.render('proposalList', { title: 'Synergy Proposal List'});                 
         }, (e) => {
            return res.status(404).send(e);
         });
        //  ProjectSubmit.find({'approve': 'true'}).then((projectSubmit)=>{
            
        //     Supervisor.find({}).then((supervisor) =>{
        //         res.render('main/proposal-des', {title: 'Synergy - Admin Dashboard', supervisor: supervisor});        
        //      });
             
        //  }, (e) => {
        //      res.status(404).send(e);
        //  });
         
        // if (id.match(/^[0-9a-fA-F]{24}$/)) {
        //    //Yes, it's a valid ObjectId, proceed with `findById` call.
        // }
    
    
});

router.get('/proposals/:id/postcancel', (req, res, next) => {
    
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


router.get('/proposals/:id/postapprove', (req, res, next) => {
    
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

router.post('/proposals/assign/:id', (req, res, next) => {
    // console.log('IDDDD ', + req.params.id);
    // Supervisor.findOne({"name" : req.body.name}).then((supervisor)=> {
    //     supervisor.proposals.push = req.params.id;
    //     console.log(req.params.id);
    //     supervisor.save((err, supervisor) => {
    //         if (err) {
    //             return res.status(500).send(err)
    //             console.log("update error " + req.params.id);
    //         }
    //         req.flash('success', 'Assigned Successfully');
    //         res.redirect('/proposals');
    //     });

    //  }
     Supervisor.findOneAndUpdate(
        {"name": req.body.name},
        { $push: {"proposals": req.params.id}},
        {  safe: true, upsert: true},
          function(err, supervisor) {
            if(err){
               console.log(err);
               return res.send(err);
            }else{
                req.flash('success', 'Assigned Successfully');
                res.redirect('/approved');
            }
         });
});
module.exports = router;