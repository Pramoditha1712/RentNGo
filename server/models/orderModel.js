const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Buyer info
  },
  userDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
    // Add more fields if needed
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'OwnerProduct',
      },
      ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      ownerDetails: {
        name: String,
        email: String,
        // Optional: address or contact
      },
      name: {
        type: String,
        required: true,
      },
      description: String,
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      imgUrls: {
        type: [String],
        default: [],
      },
      status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
      },
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);