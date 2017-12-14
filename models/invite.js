const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    email: {type:String, unique: true, lowercase: true},
    secretToken : {type: String}
});

module.exports = mongoose.model('Invite', UserSchema);