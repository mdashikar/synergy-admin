var mongoose = require('mongoose');
var moment = require('moment');
const validator = require('validator');
const _ = require('lodash');



var ProjectSubmit = mongoose.model('ProjectSubmit', {
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
    status:{
        type: 'string'
    },
    projectType:{
        type: 'string',
        required: true,
        minLength: 2,
        trim:true
    }, 
    projectCourseCode: {
        type: 'string',
        required: true
    },
    projectTools:{
        type: 'string',
        required: true,
        minLength: 5,
        trim:true
    },
    projectAbstract:{
        type: 'string',
        required: true,
        minLength: 2,
        trim:true
    },
    projectObject:{
        type: 'string',
        required: true,
        minLength: 2,
        trim:true
    },
    projectKeyFeatures:{
        type: 'string',
        required: true,
        minLength: 2,
        trim:true
    },
    projectNumberOfModules:{
        type: 'string',
        minLength: 2,
        trim:true
    },
    projectConclusion:{
        type: 'string',
        required: true,
        minLength: 2,
        trim:true
    },
    
    memberName:[{
        type: String,
        required: true,
        minLength: 5,
        trim:true
    }],
    memberEmail:[{
        type:  String,
        required: true,
        minLength: 5,
        unique:true,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        },
        trim:true
    }],
    memberId:[{
        type: Number,
        required: true,
        unique: true,
        minLength: 8,
        trim:true
    }],
    memberNumber: [{
        type: Number,
        required: true,
        unique: true,
        minLength: 10,
        trim: true
    }],
    pending:{
        type : Boolean,
        default : true
    },
    semester : {
        type: String
    },
    year: {
        type: Number
    },
    time: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
 
  // _creator: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     required:true
  // }
});


module.exports = {ProjectSubmit};