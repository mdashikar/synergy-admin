const router = require('express').Router();
const User = require('../models/user');
const Supervisor = require('../models/supervisor');
const _ = require('lodash');
const {ProjectSubmit} = require('../models/proposals');
var template = require('../server/template');
var upload = require('../server/upload');
const async = require('async');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const mailer = require('../misc/mailer');
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
router.get('/supervisors', (req, res, next) => {
    if(req.user){
        Supervisor.find({}).then((supervisor)=>{
           // let len = supervisor.proposals.lenth();
           // console.log('lenthhh', len);
            res.render('main/supervisor', {title: 'Synergy - Admin Dashboard', supervisor: supervisor, message: req.flash('success')});
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
        
        ProjectSubmit.findById(req.params.id).then((projectSubmit)=>{
            //res.render('main/proposal-des', {title: req.params.projectName, projectSubmit: projectSubmit});
            Supervisor.find({}).then((supervisor) =>{
                res.render('main/proposal-des', {title: 'Synergy - Admin Dashboard',projectSubmit: projectSubmit, supervisor: supervisor});        
            });
            // res.render('proposalList', { title: 'Synergy Proposal List'});                 
         }, (e) => {
            return res.status(404).send(e);
         });
    
});


router.post('/proposals/:id/reject-message', (req, res, next) => {
    var message = req.body.message;
    ProjectSubmit.findOne({_id : req.params.id}).then((projectSubmit) => {
        var emails = projectSubmit.memberEmail;
        var projectName = req.params.projectName;

            emails.forEach(function(email)
            {
                console.log(email);
                
                const html = `Dear Student,
                <br/><br/>
                ${message}
                <br/>
                All the best
                <br/><br/><br/>
                Regards,
                <br/>                
                Team Synergy`;
                 
                mailer.sendEmail('admin@synergy.com',email,'Your proposal has been rejected',html);
               
            });
            // Update each attribute with any possible attribute that may have been submitted in the body of the request
            // If that attribute isn't in the request body, default back to whatever it was before.
            // projectSubmit.reject = true;
            // projectSubmit.pending = false;

          

            // // Save the updated document back to the database
            // projectSubmit.save((err, projectSubmit) => {
            //     if (err) {
            //         return res.status(500).send(err)
            //         console.log("update error " + req.params.id);
            //     }
            //     req.flash('success', 'Rejected');
            //     res.redirect('/proposals');
            // });
            next();
            
         
     });
     ProjectSubmit.findOneAndRemove({_id : req.params.id}).then((projectSubmit) => {
                req.flash('success', 'Rejected');
                res.redirect('/proposals');
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
                res.redirect('/proposals');
            }
         });
         ProjectSubmit.findOne({_id : req.params.id}).then((projectSubmit)=>{
            console.log("This is postapprove id " + req.params.id);
                // Update each attribute with any possible attribute that may have been submitted in the body of the request
                // If that attribute isn't in the request body, default back to whatever it was before.
                projectSubmit.pending = false;
                
    
                // Save the updated document back to the database
                projectSubmit.save((err, projectSubmit) => {
                    if (err) {
                        return res.status(500).send(err)
                        console.log("update error " + req.params.id);
                    }
                });
             
         });
});

router.get('/supervisor-list', (req, res) => {
    if(req.user){        
                    Supervisor.find().then((supervisors)=>{
                    let projectMember = [];
                    supervisors.forEach( function(i){
                        console.log('Proposals under supervisor ' + i.name+': ' + i.proposals);
                        projectMember.push(i.proposals);              
                    });                 
                    for(var i = 0; i<projectMember.length; i++){
                        var array = projectMember[i];
                        for(var j = 0; j < array.length; j++){
                            console.log('Each Proposals id under supervisor', array[j]);
                            ProjectSubmit.findById(array[j]).then((projectMembers) => {
                                console.log(projectMembers._id);
                                // let totalMembers = [];
                                // for(let i = 0; i < projectMembers.length; i++){
                                //     console.log(projectMembers[i]);
                                //     totalMembers.push(i.memberId);
                                // }
                                // console.log(totalMembers);
                                // // projectMembers.forEach( function(items){
                                // //     //console.log(items);
                                // //     totalMembers.push(items.memberId);
                                // // });
                                // console.log(totalMembers);
                                // for(var x = 0; x< totalMembers.length; x++){
                                //     var members = totalMembers[i];                                   
                                // }
                            });
                            
                        }
                        console.log('Number of proposals ', array.length);
                    }
                    res.render('main/supervisor', {title: 'Synergy - Admin Dashboard', supervisors: supervisors, message: req.flash('success')});                        
                    

                 }, (e) => {
                     res.status(404).send(e);
                 });
        
            }else{
                res.render('accounts/login', {title: 'Synergy - Admin Dashboard'});
            }
});
router.get('/supervisor-list/:id', (req,res) => {
    Supervisor.find({'_id': req.params.id}).then((proposals) => {
        let totalProposals = [];
        let proposal = [];
        proposals.forEach(function (items){
            totalProposals.push(items.proposals);
        });
        for(let i = 0; i<totalProposals.length; i++){
            let singleProposals = totalProposals[i];
            for(let j = 0; j<singleProposals.length;j++){
                ProjectSubmit.find({'_id': singleProposals[j]}).then((docs) => {                    
                    docs.forEach(function(i){
                        proposal.push(i);
                    });
                    console.log(proposal);
                });
                
            }
        }
        res.render('main/tables', {title: 'Single Proposal', proposal:proposal});
        
    });
});

module.exports = router;