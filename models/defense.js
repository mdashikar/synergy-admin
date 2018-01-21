var mongoose = require('mongoose');
var moment = require('moment');
const validator = require('validator');
const _ = require('lodash');



var Defense = mongoose.model('Defense', {
   // _id : mongoose.Schema.Types.ObjectId,
    projectName:{
        type: 'string',
        required: true,
        minLength: 5,
        trim:true
    },
    supervisorName:{
        type: 'string'
    },
   
    
    memberName:[{
        type: String,
        required: true,
        minLength: 5,
        trim:true
    }],
  
    memberId:[{
        type: Number,
        required: true,
        unique: true,
        minLength: 8,
        trim:true
    }],
  
   startingTime:{
       type: Number
   },
   endingTime:{
       type: Number
   },
   day:{
       type: String
   },
   proposal_id:{type: String}
});


module.exports = Defense;