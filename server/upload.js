var csv = require('fast-csv');
var mongoose = require('mongoose');
var RegisteredStudent = require('../models/registered_user');
 
exports.post = function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    var registered_userFile = req.files.file;
 
    var registered = [];
         
    csv
     .fromString(registered_userFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
          
         registered.push(data);
         
     })
     .on("end", function(){
        RegisteredStudent.create(registered, function(err, documents) {
            if (err) throw err;
         });
          
         res.render('main/registered_user', {registered, message: req.flash('success', `${registered.length}`)});
     });
};