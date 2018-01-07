const router = require('express').Router();
const User = require('../models/user');
const Supervisor = require('../models/supervisor');
const _ = require('lodash');
const { ProjectSubmit } = require('../models/proposals');
var template = require('../server/template');
var upload = require('../server/upload');
const async = require('async');
const mongoose = require('mongoose');
//mongoose.Promise = require('bluebird');
const mailer = require('../misc/mailer');
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const Invite = require('../models/invite');
var ObjectId = mongoose.Types.ObjectId;



router.route('/')
    .get((req, res, next) => {
        if (req.user) {
            ProjectSubmit.find().then((projectSubmit) => {

                res.render('main/index', {
                    title: 'Synergy - Admin Dashboard',
                    projectSubmit: projectSubmit,
                    errorMessage: req.flash('errors'),
                    successMessage: req.flash('success')
                });
                // res.render('proposalList', { title: 'Synergy Proposal List'});

            }, (e) => {
                res.status(404).send(e);
            });

        } else {
            res.render('accounts/login', {
                title: 'Synergy - Admin Dashboard',
                errorMessage: req.flash('errors'),
                successMessage: req.flash('success')
            });
        }

    })
    .post(passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));


router.get('/remove-supervisors', (req, res, next) => {
    if (req.user) {
        Supervisor.find({}).then((remove_supervisor) => {
            // let len = supervisor.proposals.lenth();
            // console.log('lenthhh', len);
            res.render('main/supervisor', { title: 'Synergy - Admin Dashboard', remove_supervisor: remove_supervisor, successMessage: req.flash('success') });
            // res.render('proposalList', { title: 'Synergy Proposal List'});

        }, (e) => {
            res.status(404).send(e);
        });



    } else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
});


router.get('/proposals', (req, res, next) => {
    if (req.user) {

        ProjectSubmit.find({ 'pending': 'true' }).then((projectSubmit) => {
            res.render('main/tables', { title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit, message: req.flash('success') });
            // res.render('proposalList', { title: 'Synergy Proposal List'});

        }, (e) => {
            res.status(404).send(e);
        });

    } else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
});

router.get('/registered_user', (req, res, next) => {
    if (req.user) {
        res.render('main/registered_user', { title: 'Synergy - Admin Dashboard' });
    } else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
});

router.get('/template', template.get);

router.post('/registered_user', upload.post);

router.get('/proposals/:id', (req, res, next) => {

    ProjectSubmit.findById(req.params.id).then((projectSubmit) => {
        //res.render('main/proposal-des', {title: req.params.projectName, projectSubmit: projectSubmit});
        Supervisor.find({}).then((supervisor) => {
            res.render('main/proposal-des', { title: 'Synergy - Admin Dashboard', projectSubmit: projectSubmit, supervisor: supervisor });
        });
        // res.render('proposalList', { title: 'Synergy Proposal List'});                 
    }, (e) => {
        return res.status(404).send(e);
    });

});


router.post('/proposals/:id/reject-message', (req, res, next) => {
    var message = req.body.message;
    ProjectSubmit.findOne({ _id: req.params.id }).then((projectSubmit) => {
        var emails = projectSubmit.memberEmail;
        var projectName = req.params.projectName;

        emails.forEach(function(email) {
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

            mailer.sendEmail('admin@synergy.com', email, 'Your proposal has been rejected', html);

        });

        next();


    });
    ProjectSubmit.findOneAndRemove({ _id: req.params.id }).then((projectSubmit) => {
        req.flash('success', 'Rejected');
        res.redirect('/proposals');
    });
});


//Removing supervisors from admin
router.get('/remove-supervisor/:email', (req, res, next) => {
    Invite.findOneAndRemove({ email: req.params.email }).then((invite) => {
        next();
    });
    Supervisor.findOneAndRemove({ email: req.params.email }).then((supervisor) => {
        res.redirect('/remove-supervisors');
    });
});



router.post('/proposals/assign/:id', (req, res, next) => {
    Supervisor.findOneAndUpdate({ "name": req.body.name }, { $push: { "proposals": req.params.id } }, { safe: true, upsert: true },
        function(err, supervisor) {
            if (err) {
                console.log(err);
                return res.send(err);
            } else {
                req.flash('success', 'Assigned Successfully');
                res.redirect('/proposals');
            }
        });
    ProjectSubmit.findOne({ _id: req.params.id }).then((projectSubmit) => {
        console.log("This is postapprove id " + req.params.id);
        // Update each attribute with any possible attribute that may have been submitted in the body of the request
        // If that attribute isn't in the request body, default back to whatever it was before.
        projectSubmit.pending = false;
        projectSubmit.save((err, projectSubmit) => {
            if (err) {
                return res.status(500).send(err);
            }
        });

    });
});
router.get('/supervisor-list', (req, res) => {
    if (req.user) {
        Supervisor.find().then((supervisors) => {
            let projectMember = [];
            supervisors.forEach(function(i) {
                //console.log('Proposals under supervisor ' + i.name+': ' + i.proposals);
                projectMember.push(i.proposals);
            });

            async function newArr(arr) {
                for (var i = 0; i < arr.length; i++) {
                    var array = arr[i];
                    var count = 0;
                    for (var j = 0; j < array.length; j++) {
                        //console.log('Each Proposals id under supervisor', array[j]);
                        await ProjectSubmit.findById(array[j], function(err, result) {
                            if (err) return err
                                //results +=  result.memberId.length;
                            count += result.memberId.length;
                        });
                    }
                    console.log(count);
                    supervisors[i]['__v'] = count;
                    count = 0;

                }
                console.log(supervisors);

                console.log('Blocking');
                res.render('main/supervisor', { title: 'Synergy - Admin Dashboard', supervisors: supervisors, message: req.flash('success') });
            }

            newArr(projectMember);
        }, (e) => {
            res.status(404).send(e);
        });

    } else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
});
// router.get('/supervisor-list', (req, res) => {
//     if (req.user) {
//         console.log('In supervisor list route');
//         let fetchSupervisor = function() {
//             return new Promise(function(resolve, reject){
//                 Supervisor.find().then((result) => {
//                     resolve(result);
//                 });
//             });
//         }

//         let fetchProposal = function(docs){
//             return new Promise(function(resolve, reject) {

//             });
//         } 
//         let fetchMembers = function(docs){
//             return new Promise(function(resolve, reject){
//                 resolve(docs);
//             });
//         } 
//         fetchSupervisor().then(function(result){
//             return fetchProposal(result);
//         }).then(function(result){
//             return fetchMembers(result);
//         }).then(function(result){
//             console.log('Execute promoise ' + result);
//         });
//     }else {
//         res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
//     }
// });


router.get('/supervisor-list/:id', (req, res, next) => {
    if (req.user) {
        async function getResult() {
            let result = await Supervisor.find({ '_id': req.params.id });
            let proposals = result[0];
            // console.log(proposals.proposals);
            var proposal = [];
            for (let i = 0; i < proposals.proposals.length; i++) {
                await ProjectSubmit.find({ '_id': proposals.proposals[i] }).then((doc) => {
                    proposal.push(_.toPlainObject(doc));
                });
            }
            res.render('main/tables', { title: 'Single Proposal', proposal: proposal });
            //console.log(proposal);
        }
        getResult();
    } else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
});

module.exports = router;