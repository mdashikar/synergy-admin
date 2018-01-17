const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  email: { type: String, unique: true, lowercase: true, trim: true},
  name: String,
  username: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  boards: [{
     type: Schema.Types.ObjectId, ref: 'Boards'
  }],
  proposal_id : String,
  secretToken : String,
  resetPasswordToken : {type : String},
  resetPasswordExpires : {type : Date}
});

StudentSchema.pre('save', function(next) {
  var student = this;
  if (!student.isModified('password')) return next();
  if (student.password) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);
      bcrypt.hash(student.password, salt, null, function(err, hash) {
        if (err) return next(err);
        student.password = hash;
        next(err);
      });
    });
  }
});


StudentSchema.methods.comparePassword = function(password) {

    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('Student', StudentSchema);
