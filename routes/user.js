const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');
const passportConfig = require('../config/passport');
const User = require('../models/user');
const mailer = require('../misc/mailer');
const Invite = require('../models/invite');
var async = require('async');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';
const Supervisor = require('../models/supervisor');

var value = "hi";

router.route('/signup')
    .get( (req, res, next) => {
        res.render('accounts/signup', {errorMessage : req.flash('errors')});
    })
    .post((req, res, next) => 
    {
       User.findOne({email: req.body.email}, function(err, existingUser){
           if(existingUser){
               req.flash('errors', 'Email address already exists try different one!!');
               res.redirect('/signup');
               console.log("In db save body");
           }
           
           else{
                var user = new User();
                user.name = req.body.name;
                user.email = req.body.email;
                user.username = req.body.username;
                user.password = req.body.password;             
                user.save(function(err){
                    // req.logIn(user, function(err){
                        if(err) return next(err);
                        res.redirect('/');
                    // });
                });
           }
       });
       User.findOne({username: req.body.username}, function(err, existingUser){
        if(existingUser){
            req.flash('errors', 'Username already exists try different one!!');
            res.redirect('/signup');
        }else{
             var user = new User();
             user.name = req.body.name;
             user.email = req.body.email;
             user.username = req.body.username;
             user.password = req.body.password;    
             //user.secretToken = req.body.secretToken;          
             user.save(function(err){
                 // req.logIn(user, function(err){
                     if(err) return next(err);
                     res.redirect('/');
                 // });
             });
        }
    });

    });




router.get('/user-logout', (req,res, next) => {
    req.logout();
    res.redirect('/');
});



router.post('/invite-supervisor', (req,res,next) => {
  if(req.user)
  {
    var secretToken = randomstring.generate();
    
      
    Invite.findOne({email: req.body.invite_email}, function(err, existingUser){
        console.log("inside invite");
        if(existingUser){
            req.flash('errors', 'Already invitation sent');
            res.redirect('/');
        }else{
          


            var invite = new Invite();
            var email = req.body.invite_email;

            invite.email = email;
            invite.secretToken = secretToken;


            function encrypt(text){
              var cipher = crypto.createCipher(algorithm,password)
              var crypted = cipher.update(text,'utf8','hex')
              crypted += cipher.final('hex');
              return crypted;
              };
              console.log(email);
              var encryptEmail = encrypt(email);
              console.log(encryptEmail);

            invite.save(function(err){
                
                    if(err) return next(err);
                    
                    // const html = `Hi there,
                    // <br/><br/>
                    // This is a supervisor invitation from CSE department of Leading University
                    // to supervise third year and final year project.<br/><br/>
                    // To register as a supervisor please go through the following link : 
                    // http://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}/${encryptEmail} <br/><br/><br/>
                                        
                    // Have a good day! <br/><br/>
                    // Regards, <br/>
                    // Minhazul Haque Riad  <br/>
                    // Senior Lecturer and Project Convenor  <br/>
                    // CSE deapartment,Leading University,Sylhet`;
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
                      <p style='text-align:center;margin:0;font-family:Georgia,Time,sans-serif;font-size:26px;color:#222222;'><span class="specbundle2"><span class="font1">Welcome to<strong> Synergy</strong> &nbsp;</span></span></p>
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
                                                  <h2 style="text-align: center">Register as a supervisor</h2>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                
                                          <tr><td height='15'> </td></tr>
                
                                          <tr>
                                            <td align='left'>
                                              <div class="contentEditableContainer contentTextEditable">
                                                <div class="contentEditable" align='center'>
                                                  <p >Hi there,
                                  <br/><br/>
                                  This is a supervisor invitation from CSE department of Leading University
                                  to supervise third year and final year project.<br/><br/>
                                  To register as a supervisor please go through the following link : <br>
                                  <a href="http://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}/${encryptEmail}">http://s-supervisor.herokuapp.com/signup-supervisor/${secretToken}/${encryptEmail}</a> <br/><br/><br/>
                
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



                   
                    
                
                  
        
                    mailer.sendEmail('admin@synergy.com',email,'Please signup through this link',html);
                    req.flash('success', 'Invitation sent');
                    res.redirect('/');
                
            });
             
        }
    });
  }
  else
  {
      res.render('accounts/login', { title: 'Synergy - Admin Dashboard' });
  
  }
    
    
                 
    

});


//Forgot password



router.post('/forgot-password', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.emailForgot }, function(err, user) {
          if (!user) {
            req.flash('errors', 'No account with that email address exists.');
            return res.redirect('/');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        // const html = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        // 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        // 'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
        // 'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        // const html = `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/><br/> 
        // Please click on the following link, or paste this into your browser to complete the process:<br/><br/>
        // http://${req.headers.host}/reset-password/${token} <br/><br/>
        // If you did not request this, please ignore this email and your password will remain unchanged.`;

        
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
                                      <h2 style="text-align: center">Forgot Password?</h2>
                                    </div>
                                  </div>
                                </td>
                              </tr>
    
                              <tr><td height='15'> </td></tr>
    
                              <tr>
                                <td align='left'>
                                  <div class="contentEditableContainer contentTextEditable">
                                    <div class="contentEditable" align='center'>
                                      <p >You are receiving this because you (or someone else) have requested the reset of the password for your account.<br/><br/> 
                        Please click on the following link, or paste this into your browser to complete the process: http://${req.headers.host}/reset-password/${token}" <br/><br/>
                        If you did not request this, please ignore this email and your password will remain unchanged.
    
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
      

        mailer.sendEmail('admin@synergy.com',req.body.emailForgot,'Reset password',html);
       
        req.flash('success', 'A reset-password mail has been sent to your email address.Check it out!');
        res.redirect('/');

        
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });

//reset password


router.get('/reset-password/:token', function(req, res) {
     User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    //User.findOne({resetPasswordToken:req.params.token}, function(err, user) {
        
      if (!user) {
        req.flash('errors', 'No user with this email');
       // console.log("inside reset password get");
        return res.redirect('/');
      }
      res.render('accounts/reset-password', {
        user: user
      });
   
    });
  });
router.post('/reset-password/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      //  User.findOne({resetPasswordToken: req.params.token}, function(err, user) {
          if (!user) {
            req.flash('errors', 'Password reset token is invalid or has expired.');
            return res.redirect('/');
          }
  
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
  
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        
        // const html = `Hello,  <br/><br/>
        // This is a confirmation that the password for your account ${user.email} has just been changed.`;

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
                                      <h2 style="text-align: center">Password change confirmation</h2>
                                    </div>
                                  </div>
                                </td>
                              </tr>
    
                              <tr><td height='15'> </td></tr>
    
                              <tr>
                                <td align='left'>
                                  <div class="contentEditableContainer contentTextEditable">
                                    <div class="contentEditable" align='center'>
                                      <p >Hello,  <br/><br/>
                        This is a confirmation that the password for your account ${user.email} has just been changed.
                        
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
        
        mailer.sendEmail('admin@synergy.com',user.email,'Password change confirmation',html);
        res.redirect('/');
        
      }
    ], function(err) {
      res.redirect('/');
    });
  });


  


module.exports = router;