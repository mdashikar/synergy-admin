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
const Student = require('../models/student');
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
    var id = req.params.id;


    ProjectSubmit.findById(id).then((projectSubmit) => {

        //res.render('main/proposal-des', {title: req.params.projectName, projectSubmit: projectSubmit});
        if (projectSubmit.pending == false) {
            async function getStatus() {
                var counter = 0;
                console.log("Inside proposal");
                for (var i = 0; i < projectSubmit.memberId.length; i++) {
                    await Student.findOne({ email: projectSubmit.memberEmail[i] }).then((student) => {
                        if (student.proposal_id == id) {

                            counter++;
                            console.log("counting", counter);
                            if (projectSubmit.memberId.length == counter) {
                                projectSubmit.status = "Running";
                                projectSubmit.save();
                                console.log("status changed");

                            }
                        }

                    });
                }
                // console.log(projectSubmit.memberId.length," : ",counter);
            }
            getStatus();

        }
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

var supervisorName;

router.post('/proposals/assign/:id', (req, res, next) => {
    Supervisor.findOneAndUpdate({ "name": req.body.name }, { $push: { "proposals": req.params.id } }, { safe: true, upsert: true },
        function(err, supervisor) {
            if (err) {
                console.log(err);
                return res.send(err);
            } else {
                supervisorName = supervisor.name;
                req.flash('success', 'Assigned Successfully');
                res.redirect('/proposals');
            }
        });

    ProjectSubmit.findOne({ _id: req.params.id }).then((projectSubmit) => {
        console.log("This is post approve id " + req.params.id);
        var id = projectSubmit._id;
        // Update each attribute with any possible attribute that may have been submitted in the body of the request
        // If that attribute isn't in the request body, default back to whatever it was before.
        projectSubmit.pending = false;
        projectSubmit.supervisorName = supervisorName;
        projectSubmit.save((err, projectSubmit) => {
            if (err) {
                return res.status(500).send(err);
            }
            var emails = projectSubmit.memberEmail;

            emails.forEach(function(email) {
                console.log(email);
                console.log(supervisorName);

                const html = `Dear Student,
                <br/><br/>
               
               Congratulations! We are very glad to inform you that your project proposal is accepted
               and your supervisor name is ${supervisorName}
               <br/>
               To register in synergy platform please go through the following link : 
               http://synergy-student.herokuapp.com/signup/${id}
               <br/><br/><br/>
                                                   
               Have a good day!
               <br/><br/>
               Regards,
               <br/>
               Minhazul Haque Riad
               <br/>
               Senior Lecturer and Project Convenor
               <br/>
               CSE deapartment,Leading University,Sylhet`;


                mailer.sendEmail('admin@synergy.com', email, 'Your proposal is accepted', html);

            });


        });

    });
});
var nameOfSupervisorForRemove;
//Removing accepted proposals
router.get('/remove-accepted-proposal/:id', (req, res, next) => 
{
    var id = req.params.id;
    Student.findOneAndRemove({ proposal_id: id }).then((student) => {
        console.log("inside student");
        //next();
        ProjectSubmit.findOneAndUpdate({ _id: id },
	 { "$set": { "pending": true, "status": "Not Started"}},
	 function(err, projectSubmit) {
        console.log("inside proposal");
            if (err) {
                console.log(err);
                return res.send(err);
            } else {
                nameOfSupervisorForRemove = projectSubmit.supervisorName;
                Supervisor.findOne({ name: nameOfSupervisorForRemove }).then((supervisor) => {
                    console.log("inside supervisor");

                    for (var i = 0; i < supervisor.proposals.length; i++) {
                        if (supervisor.proposals[i] == id) {

                            console.log("found");
                            Supervisor.findOneAndUpdate({ "name": nameOfSupervisorForRemove }, { $pull: { "proposals": id } }, { safe: true, upsert: true },
                                function(err, supervisor) {
                                    if (err) {
                                        console.log(err);
                                        return res.send(err);
                                    }
                                    console.log("removed from supervisor");
                                });
                            break;

                        }
                    }





                    console.log(nameOfSupervisorForRemove);
                    res.redirect(`/supervisor-list`);
                });
            }
        });
    });
    // ProjectSubmit.findOneAndUpdate(
    // {_id : id},{pending: true},function(err, projectSubmit) 
    //     {
    //         if(err){
    //         console.log(err);
    //         return res.send(err);
    //         }else{
    //             nameOfSupervisorForRemove = projectSubmit.supervisorName;   
    //             Supervisor.findOne({name : nameOfSupervisorForRemove}).then((supervisor) => {

    //                     for(var i=0; i<supervisor.proposals.length; i++)
    //                     {
    //                         if(supervisor.proposals[i] == id)
    //                         {

    //                             console.log("found");
    //                              Supervisor.findOneAndUpdate(
    //                                 {"name": nameOfSupervisorForRemove},
    //                                 { $pull: {"proposals": id}},
    //                                 {  safe: true, upsert: true},
    //                                   function(err, supervisor) {
    //                                     if(err){
    //                                        console.log(err);
    //                                        return res.send(err);
    //                                     }
    //                                 });  
    //                                 break;                 

    //                         }
    //                     }





    //                 console.log(nameOfSupervisorForRemove);
    //                 res.redirect(`/supervisor-list`);
    //             });
    //         }
    // });



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
                var count = 0;
                for (var i = 0; i < arr.length; i++) {
                    var array = arr[i];

                    for (var j = 0; j < array.length; j++) {
                        //console.log('Each Proposals id under supervisor', array[j]);
                        await ProjectSubmit.findById(array[j], function(err, result) {
                            if (err) return err;
                            //console.log(result);
                            //results +=  result.memberId.length;
                            count += result.memberId.length;
                        });
                    }
                    console.log(count);
                    supervisors[i]['__v'] = count;
                    count = 0;

                }
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


router.get('/all-student', (req, res, next) => {
    ProjectSubmit.find().then((students) => {
        res.render('main/tables', { students: students, title: 'All students' });
    });
});

router.get('/export', (req, res, next) => {
    res.render('main/export');
});

//Checking status of project



module.exports = router;