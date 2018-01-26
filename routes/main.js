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
var ontime = require("ontime");
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

        ProjectSubmit.find({ 'pending': 'true' }).sort({_id: -1}).then((projectSubmit) => {
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
    
                // const html = `Dear Student,
                //     <br/><br/>
                //     ${message}
                //     <br/>
                //     All the best
                //     <br/><br/><br/>
                //     Regards,
                //     <br/>                
                //     Team Synergy`;
                const html = `<html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <title>[SUBJECT]</title>
                  <style type="text/css">
                  body {
                   padding-top: 0 !important;
                   padding-bottom: 0 !important;
                   padding-top: 0 !important;
                   padding-bottom: 0 !important;
                   margin:0 !important;
                   width: 100% !important;
                   -webkit-text-size-adjust: 100% !important;
                   -ms-text-size-adjust: 100% !important;
                   -webkit-font-smoothing: antialiased !important;
                 }
                 .tableContent img {
                   border: 0 !important;
                   display: block !important;
                   outline: none !important;
                 }
                 a{
                  color:#382F2E;
                }
            
                p, h1{
                  color:#382F2E;
                  margin:0;
                }
                p{
                  text-align:left;
                  color:#999999;
                  font-size:14px;
                  font-weight:normal;
                  line-height:19px;
                }
            
                a.link1{
                  color:#382F2E;
                }
                a.link2{
                  font-size:16px;
                  text-decoration:none;
                  color:#ffffff;
                }
            
                h2{
                  text-align:left;
                   color:#222222; 
                   font-size:19px;
                  font-weight:normal;
                }
                div,p,ul,h1{
                  margin:0;
                }
            
                .bgBody{
                  background: #ffffff;
                }
                .bgItem{
                  background: #ffffff;
                }
                
            @media only screen and (max-width:480px)
                    
            {
                    
            table[class="MainContainer"], td[class="cell"] 
                {
                    width: 100% !important;
                    height:auto !important; 
                }
            td[class="specbundle"] 
                {
                    width:100% !important;
                    float:left !important;
                    font-size:13px !important;
                    line-height:17px !important;
                    display:block !important;
                    padding-bottom:15px !important;
                }
                    
            td[class="spechide"] 
                {
                    display:none !important;
                }
                    img[class="banner"] 
                {
                          width: 100% !important;
                          height: auto !important;
                }
                    td[class="left_pad"] 
                {
                        padding-left:15px !important;
                        padding-right:15px !important;
                }
                     
            }
                
            @media only screen and (max-width:540px) 
            
            {
                    
            table[class="MainContainer"], td[class="cell"] 
                {
                    width: 100% !important;
                    height:auto !important; 
                }
            td[class="specbundle"] 
                {
                    width:100% !important;
                    float:left !important;
                    font-size:13px !important;
                    line-height:17px !important;
                    display:block !important;
                    padding-bottom:15px !important;
                }
                    
            td[class="spechide"] 
                {
                    display:none !important;
                }
                    img[class="banner"] 
                {
                          width: 100% !important;
                          height: auto !important;
                }
                .font {
                    font-size:18px !important;
                    line-height:22px !important;
                    
                    }
                    .font1 {
                    font-size:18px !important;
                    line-height:22px !important;
                    
                    }
            }
            
                </style>
            
            <script type="colorScheme" class="swatch active">
            {
                "name":"Default",
                "bgBody":"ffffff",
                "link":"382F2E",
                "color":"999999",
                "bgItem":"ffffff",
                "title":"222222"
            }
            </script>
            
              </head>
              <body paddingwidth="0" paddingheight="0"   style="padding-top: 0; padding-bottom: 0; padding-top: 0; padding-bottom: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;" offset="0" toppadding="0" leftpadding="0">
                <table bgcolor="#ffffff" width="100%" border="0" cellspacing="0" cellpadding="0" class="tableContent" align="center"  style='font-family:Helvetica, Arial,serif;'>
              <tbody>
                <tr>
                  <td><table width="600" border="0" cellspacing="0" cellpadding="0" align="center" bgcolor="#ffffff" class="MainContainer">
              <tbody>
                <tr>
                  <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td valign="top" width="40">&nbsp;</td>
                  <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
              <!-- =============================== Header ====================================== -->   
                <tr>
                    <td height='75' class="spechide"></td>
                    
                    <!-- =============================== Body ====================================== -->
                </tr>
                <tr>
                  <td class='movableContentContainer ' valign='top'>
                      <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td height="35"></td>
                </tr>
                <tr>
                  <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td valign="top" align="center" class="specbundle"><div class="contentEditableContainer contentTextEditable">
                                            <div class="contentEditable">
                                              <p style='text-align:center;margin:0;font-family:Georgia,Time,sans-serif;font-size:26px;color:#222222;'><span class="specbundle2"><span class="font1">Welcome to<strong> Synergy</strong>&nbsp;</span></span></p>
                                            </div>
                                          </div></td>
            
                </tr>
              </tbody>
            </table>
            </td>
                </tr>
              </tbody>
            </table>
                    </div>
                    <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                                      <tr><td height='55'></td></tr>
                                      <tr>
                                        <td align='left'>
                                          <div class="contentEditableContainer contentTextEditable">
                                            <div class="contentEditable" align='center'>
                                              <h2 style="text-align: center">Your proposal is rejected</h2>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
            
                                      <tr><td height='15'> </td></tr>
            
                                      <tr>
                                        <td align='left'>
                                          <div class="contentEditableContainer contentTextEditable">
                                            <div class="contentEditable" align='center'>
                                              <p >Dear Student,
                                                        ${message}
                                                        <br/>
                                                        All the best
                                                        <br/><br/><br/>
                                                        
                                  Have a good day! <br/><br/>
                                  Regards, <br/>
                                  Minhazul Haque Riad  <br/>
                                  Senior Lecturer and Project Convenor  <br/>
                                  CSE deapartment,Leading University,Sylhet
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
            
                                      <tr><td height='55'></td></tr>
            
                                      
                                      <tr><td height='20'></td></tr>
                                    </table>
                    </div>
                    <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            
            </table>
            
                    </div>
                    
                    <!-- =============================== footer ====================================== -->
                  
                  </td>
                </tr>
              </tbody>
            </table>
            </td>
                  <td valign="top" width="40">&nbsp;</td>
                </tr>
              </tbody>
            </table>
            </td>
                </tr>
              </tbody>
            </table>
            </td>
                </tr>
              </tbody>
            </table>
              
            </body>
              
            </html>
            `;
                
    
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
router.get('/remove-supervisor/:id', (req, res, next) => {
    if(req.user)
    {
        // Invite.findOneAndRemove({ email: req.params.email }).then((invite) => {
        //     next();
        // });
        // Supervisor.findOneAndRemove({ email: req.params.email }).then((supervisor) => {

        //     res.redirect('/remove-supervisors');
        // });
        Supervisor.findOneAndRemove({ _id: req.params.id }).then((supservisor) => {
            console.log(supervisor);
            res.redirect('/remove-supervisors');     
        });
    }
    else
    {
        res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
    }
    
});



router.post('/proposals/assign/:id', (req, res, next) => {
    if(req.user)
    {
      
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
        console.log(projectSubmit);
        console.log(req.body.name);
        
        var id = projectSubmit._id;
        projectSubmit.pending = false;
        projectSubmit.supervisorName = req.body.name;
        projectSubmit.save((err, projectSubmit) => {
            if (err) {
                return res.status(500).send(err);
            }
            var emails = projectSubmit.memberEmail;
            var secretToken = randomstring.generate();

            emails.forEach(function(email) {
                console.log(email);
               
                    function encrypt(text){
                    var cipher = crypto.createCipher(algorithm,password)
                    var crypted = cipher.update(text,'utf8','hex')
                    crypted += cipher.final('hex');
                    return crypted;
                    };
                    console.log(email);
                    var encryptEmail = encrypt(email);
                    console.log(encryptEmail);
                    

            //     const html = `Dear Student,
            //     <br/><br/>
               
            //    Congratulations! We are very glad to inform you that your project proposal is accepted
            //    and your supervisor name is ${supervisorName}
            //    <br/>
            //    To register in synergy platform please go through the following link : 
            //    http://synergy-student.herokuapp.com/signup/${id}/${encryptEmail}/${secretToken}
            //    <br/><br/><br/>
                                                   
            //    Have a good day!
            //    <br/><br/>
            //    Regards,
            //    <br/>
            //    Minhazul Haque Riad
            //    <br/>
            //    Senior Lecturer and Project Convenor
            //    <br/>
            //    CSE deapartment,Leading University,Sylhet`;
            const html = `<html xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <title>[SUBJECT]</title>
              <style type="text/css">
              body {
               padding-top: 0 !important;
               padding-bottom: 0 !important;
               padding-top: 0 !important;
               padding-bottom: 0 !important;
               margin:0 !important;
               width: 100% !important;
               -webkit-text-size-adjust: 100% !important;
               -ms-text-size-adjust: 100% !important;
               -webkit-font-smoothing: antialiased !important;
             }
             .tableContent img {
               border: 0 !important;
               display: block !important;
               outline: none !important;
             }
             a{
              color:#382F2E;
            }
        
            p, h1{
              color:#382F2E;
              margin:0;
            }
            p{
              text-align:left;
              color:#999999;
              font-size:14px;
              font-weight:normal;
              line-height:19px;
            }
        
            a.link1{
              color:#382F2E;
            }
            a.link2{
              font-size:16px;
              text-decoration:none;
              color:#ffffff;
            }
        
            h2{
              text-align:left;
               color:#222222; 
               font-size:19px;
              font-weight:normal;
            }
            div,p,ul,h1{
              margin:0;
            }
        
            .bgBody{
              background: #ffffff;
            }
            .bgItem{
              background: #ffffff;
            }
            
        @media only screen and (max-width:480px)
                
        {
                
        table[class="MainContainer"], td[class="cell"] 
            {
                width: 100% !important;
                height:auto !important; 
            }
        td[class="specbundle"] 
            {
                width:100% !important;
                float:left !important;
                font-size:13px !important;
                line-height:17px !important;
                display:block !important;
                padding-bottom:15px !important;
            }
                
        td[class="spechide"] 
            {
                display:none !important;
            }
                img[class="banner"] 
            {
                      width: 100% !important;
                      height: auto !important;
            }
                td[class="left_pad"] 
            {
                    padding-left:15px !important;
                    padding-right:15px !important;
            }
                 
        }
            
        @media only screen and (max-width:540px) 
        
        {
                
        table[class="MainContainer"], td[class="cell"] 
            {
                width: 100% !important;
                height:auto !important; 
            }
        td[class="specbundle"] 
            {
                width:100% !important;
                float:left !important;
                font-size:13px !important;
                line-height:17px !important;
                display:block !important;
                padding-bottom:15px !important;
            }
                
        td[class="spechide"] 
            {
                display:none !important;
            }
                img[class="banner"] 
            {
                      width: 100% !important;
                      height: auto !important;
            }
            .font {
                font-size:18px !important;
                line-height:22px !important;
                
                }
                .font1 {
                font-size:18px !important;
                line-height:22px !important;
                
                }
        }
        
            </style>
        
        <script type="colorScheme" class="swatch active">
        {
            "name":"Default",
            "bgBody":"ffffff",
            "link":"382F2E",
            "color":"999999",
            "bgItem":"ffffff",
            "title":"222222"
        }
        </script>
        
          </head>
          <body paddingwidth="0" paddingheight="0"   style="padding-top: 0; padding-bottom: 0; padding-top: 0; padding-bottom: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;" offset="0" toppadding="0" leftpadding="0">
            <table bgcolor="#ffffff" width="100%" border="0" cellspacing="0" cellpadding="0" class="tableContent" align="center"  style='font-family:Helvetica, Arial,serif;'>
          <tbody>
            <tr>
              <td><table width="600" border="0" cellspacing="0" cellpadding="0" align="center" bgcolor="#ffffff" class="MainContainer">
          <tbody>
            <tr>
              <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td valign="top" width="40">&nbsp;</td>
              <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
          <!-- =============================== Header ====================================== -->   
            <tr>
                <td height='75' class="spechide"></td>
                
                <!-- =============================== Body ====================================== -->
            </tr>
            <tr>
              <td class='movableContentContainer ' valign='top'>
                  <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td height="35"></td>
            </tr>
            <tr>
              <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td valign="top" align="center" class="specbundle"><div class="contentEditableContainer contentTextEditable">
                                        <div class="contentEditable">
                                          <p style='text-align:center;margin:0;font-family:Georgia,Time,sans-serif;font-size:26px;color:#222222;'><span class="specbundle2"><span class="font1">Welcome to <strong>Synergy</strong>&nbsp;</span></span></p>
                                        </div>
                                      </div></td>
             
            </tr>
          </tbody>
        </table>
        </td>
            </tr>
          </tbody>
        </table>
                </div>
                <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                                  <tr><td height='55'></td></tr>
                                  <tr>
                                    <td align='left'>
                                      <div class="contentEditableContainer contentTextEditable">
                                        <div class="contentEditable" align='center'>
                                          <h2 style="text-align: center">Your proposal is accepted</h2>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
        
                                  <tr><td height='15'> </td></tr>
        
                                  <tr>
                                    <td align='left'>
                                      <div class="contentEditableContainer contentTextEditable">
                                        <div class="contentEditable" align='center'>
                                          <p >Dear Student,
                        <br/><br/>
                       
                       Congratulations! We are very glad to inform you that your project proposal is accepted
                       and your supervisor name is <strong> ${req.body.name} </strong>.
                       <br/>
                       To register in synergy platform please go through the following link or click the button to activate your account : <br>
                       <a href="http://synergy-student.herokuapp.com/signup/${id}/${encryptEmail}/${secretToken}">http://synergy-student.herokuapp.com/signup/${id}/${encryptEmail}/${secretToken}</a>
                       <br/>
                                          
                        <br/><br/>
                                                           
                       Have a good day!
                       <br/><br/>
                       Regards,
                       <br/>
                       Minhazul Haque Riad
                       <br/>
                       Senior Lecturer and Project Convenor
                       <br/>
                       CSE deapartment,Leading University,Sylhet
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
        
                                  <tr><td height='55'></td></tr>
        
                                  <tr>
                                    <td align='center'>
                                      <table>
                                        <tr>
                                          <td align='center' bgcolor='#1A54BA' style='background:#1A54BA; padding:15px 18px;-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px;'>
                                            <div class="contentEditableContainer contentTextEditable">
                                              <div class="contentEditable" align='center'>
                                                <a target='_blank' href="http://synergy-student.herokuapp.com/signup/${id}/${encryptEmail}/${secretToken}" class='link2' style='color:#ffffff;'>Activate your Account</a>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr><td height='20'></td></tr>
                                </table>
                </div>
                <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        
        </table>
        
                </div>
                
                <!-- =============================== footer ====================================== -->
              
              </td>
            </tr>
          </tbody>
        </table>
        </td>
              <td valign="top" width="40">&nbsp;</td>
            </tr>
          </tbody>
        </table>
        </td>
            </tr>
          </tbody>
        </table>
        </td>
            </tr>
          </tbody>
        </table>
          
        </body>
          
        </html>
        `;


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
            console.log("inside proposal", projectSubmit);
                if (err) {
                    console.log(err);
                    return res.send(err);
                } else {
                    nameOfSupervisorForRemove = projectSubmit.supervisorName;
                    Supervisor.findOne({ name: nameOfSupervisorForRemove }).then((supervisor) => {
                        console.log("inside supervisor", supervisor);
    
                        for (var i = 0; i < supervisor.proposals.length; i++) {
                            if (supervisor.proposals[i] == id) {
    
                                console.log("found");
                                Supervisor.findOneAndUpdate({ "name": nameOfSupervisorForRemove }, { $pull: { "proposals": id } }, { safe: true, upsert: true },
                                    function(err, supervisor) {
                                        if (err) {
                                            console.log(err);
                                            return res.send(err);
                                        }
                                        console.log("removed from supervisor", supervisor);
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
                
                if(flag == true && ( (startTime.format('LT') == lunchTime) || (startTime.format('LT') > lunchTime)) )
                {
                    console.log("in");
                    startTime = moment(startTime).add(1, 'hours');
                    flag = false;
                   

                }
                if( (endTime == startTime.format('LT')) || (endTime < startTime.format('LT')) )
                {
                    console.log("in2");
                    startTime = temp;
                    startTime = moment(startTime).add(1, 'day');
                    temp = startTime;
                    flag = true;
                }
                    i.time = startTime.format('LLL');
                    i.save();
                    startTime = moment(startTime).add(duration, 'hours');
                    
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
    schedule.showNav = req.body.showNav;
    var time = new Date(req.body.endDate);
    var endTime = time.getTime();
    
    schedule.save(function(err){
        console.log("Schedule Data", schedule);
        if(err) return next(err);
        res.redirect('/');
    });
    console.log("Non - Blocking");

    setTimeout(function(){
        console.log('10');
      Schedule.findOneAndRemove({ _id: schedule._id }, function(err, doc) {
        if (err) {
          throw err;
        }
        console.log("updated");
      });
    }, 1000000000);
  });



module.exports = router;