const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
    startDate: Date,
    endDate: Date,
    year: String,
    semester: String,
    showNav: String
});

module.exports = mongoose.model('Schedule', ScheduleSchema);