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
router.get('/approved', (req, res, next) => {
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

router.get('/:id', (req, res, next) => {
    
        console.log(req.params.id);
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