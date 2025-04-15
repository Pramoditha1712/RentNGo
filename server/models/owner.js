const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nameOfProduct: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    rentPrice: {
        type: Number,
        required: true,
    },
    availability: {
        type: Boolean,
        default: true,
    },
    imgUrls: [{
        type: String, 
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    review: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
});

module.exports = mongoose.model('OwnerProduct', OwnerSchema);
