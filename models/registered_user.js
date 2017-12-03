var mongoose = require('mongoose');

var RegisteredStudent = mongoose.model('RegisteredStudent',{
    _id:{type: mongoose.Schema.Types.ObjectId},
   student_id: {
           type: String,
           required: true
           
   },
   course_code : {type: String, required: true, unique: true},
   created: { 
       type: Date,
       default: Date.now
   }
});

module.exports = RegisteredStudent;