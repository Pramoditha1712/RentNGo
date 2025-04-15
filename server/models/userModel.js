const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type:String,
        required:true,
    },
    phone: {
        type: Number,
        required: true,
    },
    usertype: {
        type: String,
        enum: ['renter', 'owner'],
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        zipcode: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
    },
    dateOfCreation: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
