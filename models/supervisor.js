const mongoose = require('mongoose');
const bycrpt = require('bcrypt-nodejs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const SupervisorSchema = new Schema ({
    email: {type:String, unique: true, lowercase: true},
    name: String,
    password: String,
    username: {type: String, unique: true, lowercase:true},
    proposals: [{
        proposal: {type: Schema.Types.ObjectId, ref: 'ProjectSubmit'}
    }],
    secretToken : {type: String}
});


SupervisorSchema.pre('save', function(next){
    var supervisor = this;
    if(!supervisor.isModified('password')) return next();
    if(supervisor.password){
        bycrpt.genSalt(10, function(err, salt){
            if(err) return next(err);
            bycrpt.hash(supervisor.password, salt, null, function(err, hash){
                if(err) return next();
                supervisor.password = hash;
                next(err);
            })
        })
    }
});


SupervisorSchema.methods.comparePassword = function(password){
    return bycrpt.compareSync(password, this.password);
}

module.exports = mongoose.model('Supervisor', SupervisorSchema);