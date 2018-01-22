const router = require('express').Router();
const User = require('../models/user');
const Supervisor = require('../models/supervisor');
const _ = require('lodash');
const { ProjectSubmit } = require('../models/proposals');
const registered = require('../models/registered_user');
var template = require('../server/template');
var upload = require('../server/upload');
const async = require('async');
const mongoose = require('mongoose');
//mongoose.Promise = require('bluebird');
const mailer = require('../misc/mailer');
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const moment = require('moment');
const Invite = require('../models/invite');
const Student = require('../models/student');
const Schedule = require('../models/schedule_form');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';
var ObjectId = mongoose.Types.ObjectId;





router.route('/')
    .get((req, res, next) => {
        if (req.user) {
            ProjectSubmit.find().sort({_id: -1}).limit(5).then((projectSubmit) => {

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

    if(req.user)
    {
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
    }
    else
    {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }

});


router.post('/proposals/:id/reject-message', (req, res, next) => {
    if(req.user)
    {
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
    }
    else
    {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
});


//Removing supervisors from admin
router.get('/remove-supervisor/:email', (req, res, next) => {
    if(req.user)
    {
        Invite.findOneAndRemove({ email: req.params.email }).then((invite) => {
            next();
        });
        Supervisor.findOneAndRemove({ email: req.params.email }).then((supervisor) => {
            res.redirect('/remove-supervisors');
        });
    }
    else
    {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
});

var supervisorName;

router.post('/proposals/assign/:id', (req, res, next) => {
    if(req.user)
    {
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
            var secretToken = randomstring.generate();

            emails.forEach(function(email) {
                console.log(email);
                console.log(supervisorName);
                    function encrypt(text){
                    var cipher = crypto.createCipher(algorithm,password)
                    var crypted = cipher.update(text,'utf8','hex')
                    crypted += cipher.final('hex');
                    return crypted;
                    };
                    console.log(email);
                    var encryptEmail = encrypt(email);
                    console.log(encryptEmail);
                    

                const html = `Dear Student,
                <br/><br/>
               
               Congratulations! We are very glad to inform you that your project proposal is accepted
               and your supervisor name is ${supervisorName}
               <br/>
               To register in synergy platform please go through the following link : 
               http://synergy-student.herokuapp.com/signup/${id}/${encryptEmail}/${secretToken}
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
    }
    else
    {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
});
var nameOfSupervisorForRemove;
//Removing accepted proposals
router.get('/remove-accepted-proposal/:id', (req, res, next) => 
{
    if(req.user)
    {
        var id = req.params.id;
        Student.findOneAndRemove({ proposal_id: id }).then((student) => {
            console.log("inside student");
            //next();
            ProjectSubmit.findOneAndUpdate({ _id: id },
         { "$set": { "pending": true, "status": "Not Started",
         "supervisorName": "Supervisor name will be added here when proposal is accepted"}},
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
    }
    else
    {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
    



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
                            console.log('Length ' + result.memberId.length);
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
    if(req.user)
    {
        ProjectSubmit.find({pending:false}).then((students) => {
            
            res.render('main/export', { students: students, title: 'All students' });     
        });  
        

        
    }
    else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
});

//
// router.get('/defense-schedule', (req,res,next) => {
//     if(req.user)
//     {
//         res.render('main/export', { projectSubmit: projectSubmit, title: 'Defense Schedule'});
//     }
// });
router.post('/defense-schedule', (req,res,next) => {
    if(req.user)
    {
        console.log("date : ",req.body.startingDate);
        console.log("start : ",req.body.startingTime);
        console.log("end : ",req.body.endingTime);
        console.log("lunch : ",req.body.lunchTime);
        console.log("duration : ",req.body.duration);
        console.log("semester : ",req.body.semester);
        console.log("year : ",req.body.year);
        console.log("course Code : ",req.body.courseCode);

        var flag = true;
        var date = req.body.startingDate;
        var sTime = req.body.startingTime;
        var a = date + " " + sTime;
        var startTime = moment(a,"MM-DD-YYYYY HH:mm");
        console.log("startTime: ",startTime);

        var eTime = req.body.endingTime;
        var endTime = moment(eTime,"HH:mm").format('LT');
        console.log("endTime: ",endTime);

        var lTime = req.body.lunchTime;
        var lunchTime = moment(lTime,"HH:mm").format('LT');
        console.log("LunchTime: ",lunchTime);

        var duration = req.body.duration;
        var temp = startTime;
        var year = req.body.year;
        var semester = req.body.semester;
        var courseCode = req.body.courseCode;

       
        

        
        
     
       
        // var flag = true;
        // var check = true;
        // var startTime = moment("2018-02-20 13:00","YYYY-MM-DD HH:mm");
        // var endTime = moment("14:00","HH:mm").format('LT');
        // var lunchTime = moment("16:30","HH:mm").format('LT');
        // var duration = .5;
        // var temp = startTime;
     
        ProjectSubmit.find({projectCourseCode : courseCode,
            year : year,
            semester : semester,
            pending : false}).then((projectSubmit) => 
        // ProjectSubmit.find({}).then((projectSubmit) =>                                                                                         
        {
            projectSubmit.forEach(function(i) 
            {
                if(flag == true && startTime.format('LT') == lunchTime)
                {
                    console.log("in");
                    startTime = moment(startTime).add(1, 'hours');
                    flag = false;
                   

                }
                
                    i.time = startTime.format('LLL');
                    i.save();
                    startTime = moment(startTime).add(duration, 'hours');
                    
                   
                
                if(endTime == startTime.format('LT'))
                {
                    console.log("in2");
                    startTime = temp;
                    startTime = moment(startTime).add(1, 'day');
                    temp = startTime;
                    flag = true;
                }
              
            });

            res.render('main/export', { projectSubmit: projectSubmit, title: 'Defense Schedule'});
            //res.redirect('/defense-schedule');
        });
        

        

        
        
    }
    else {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
    
    
});

router.get('/test', (req, res, next) => {
    res.render('main/test_table');
})

router.post('/schedule-form', (req, res, next) => {
    var schedule = new Schedule();
    schedule.startDate = req.body.startDate;
    schedule.endDate = req.body.endDate;
   // schedule.showNav = false;
    if(req.body.startDate){
        schedule.showNav = true;
    } 
    if(req.body.endDate){
        setTimeout(() => {
            Schedule.findOneAndUpdate({"_id": schedule._id}, {$set: {"showNav": false}},  function(err,doc) {
                if (err) { throw err; }
                else { console.log("Updated"); }
              });  
           
        }, req.body.endDate);
    }
    console.log('Show nav bar', schedule.showNav);

    schedule.save(function(err){
        res.redirect('/');
    })
  });



module.exports = router;