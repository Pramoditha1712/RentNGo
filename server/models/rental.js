const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
    rentalId: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OwnerProduct',
        required: true,
    },

    productName: {
        type: String,
        required: true,
    },
    productCategory: {
        type: String,
        required: true,
    },
    productDescription: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
        required: true,
    },
    pricePerDay: {
        type: Number,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },

    rentStartDate: {
        type: Date,
        required: true,
    },
    rentEndDate: {
        type: Date,
        required: true,
    },
    noOfDays: {
        type: Number,
        required: true,
    },
    totalRent: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid',
    },
    lateReturnPenalty: {
        type: Number,
        default: 0,
    },
    damageCharges: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Rental', RentalSchema);
