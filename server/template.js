var json2csv = require('json2csv');

exports.get = function(req, res) {

   var fields = [
       'year',
       'semester',
       'student_id',
       'course_code'
   ]; 

   var csv = json2csv({ data: '', fields: fields });

   res.set("Content-Disposition", "attachment;filename=register_students.csv");
   res.set("Content-Type", "application/octet-stream");

   res.send(csv);

};