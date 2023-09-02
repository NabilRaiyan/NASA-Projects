const mongoose = require('mongoose');
const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type:Number,
        required: false,
    },
    mission:{
        type:String,
        required:true,
    },
    rocket: {
    type:String,
    required:true,
    },
    launchDate: {type:Date, required:true},
    target: {
        type: String,
        },
    
    customers: [String],
    upcoming: {
        type: Boolean,
        required:true,
        },
    success: {
        type: Boolean,
        required:true,
        default:true,
        },
});


const launchs  = mongoose.model('Launch', launchesSchema);

module.exports = {launchs};