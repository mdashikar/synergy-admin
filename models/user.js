const mongoose = require('mongoose');
const bycrpt = require('bcrypt-nodejs');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    email: {type:String, unique: true, lowercase: true},
    name: String,
    password: String,
    username: {type: String, unique: true, lowercase:true}
});


UserSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();
    if(user.password){
        bycrpt.genSalt(10, function(err, salt){
            if(err) return next(err);
            bycrpt.hash(user.password, salt, null, function(err, hash){
                if(err) return next();
                user.password = hash;
                next(err);
            })
        })
    }
});


UserSchema.methods.comparePassword = function(password){
    return bycrpt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);