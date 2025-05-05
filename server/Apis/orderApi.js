const express = require('express');
const orderApp = express.Router();
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});

// Create Order
orderApp.post('/order', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if user exists
    const user = await User.findById(userId).select('username email phone address');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if cart exists and has products
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty or not found' });
    }

    let totalAmount = 0;
    const orderProducts = [];
    const ownerCache = new Map();

    for (const item of cart.products) {
      if (typeof item.price !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0 || item.price <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product data' });
      }

      if (!ownerCache.has(item.ownerId.toString())) {
        const owner = await User.findById(item.ownerId).select('username email');
        if (!owner) {
          return res.status(404).json({ success: false, message: `Owner ${item.ownerId} not found` });
        }
        ownerCache.set(item.ownerId.toString(), owner);
      }

      const owner = ownerCache.get(item.ownerId.toString());
      const productTotal = item.price * item.quantity;
      totalAmount += productTotal;

      orderProducts.push({
        productId: item.productId,
        ownerId: item.ownerId,
        ownerDetails: { name: owner.username, email: owner.email },
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        imgUrls: item.imgUrls,
        status: 'Pending'
      });
    }

    // Check if totalAmount is valid
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order total' });
    }

    let receipt = `receipt_${userId}_${Date.now()}`;
    if (receipt.length > 40) {
      receipt = receipt.substring(0, 40);  // Ensure it stays within the limit
    }

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects the amount in paise (i.e., 100 paise = 1 INR)
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1
    });

    // Validate Razorpay response
    if (!razorpayOrder || !razorpayOrder.id) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order'
      });
    }

    // Create and save the new order in the database
    const newOrder = new Order({
      userId,
      userDetails: {
        name: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address
      },
      products: orderProducts,
      amount: totalAmount,
      paymentStatus: 'Pending',
      razorpayDetails: {
        orderId: razorpayOrder.id
      }
    });

    await newOrder.save();

    // Empty the user's cart after the order is created
    await Cart.updateOne({ userId }, { $set: { products: [] } });

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      razorpayOrder,
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
});

// Get orders for a specific user
orderApp.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const orders = await Order.find({ userId })
      .populate({
        path: 'products.productId',
        select: 'name description imgUrls'
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: 'No orders found'
      });
    }

    // Format response using embedded ownerDetails
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      products: order.products.map(product => ({
        ...product.toObject(),
        productId: product.productId ? {
          _id: product.productId._id,
          name: product.productId.name,
          description: product.productId.description,
          imgUrls: product.productId.imgUrls
        } : null,
        ownerDetails: product.ownerDetails || { 
          name: 'Unknown Owner',
          email: '',
          phone: ''
        }
      }))
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: err.message
    });
  }
});

// Get all orders containing products owned by a specific owner
orderApp.get('/orders-with-owners/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get all orders for the user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: 'No orders found for this user'
      });
    }

    // Extract unique ownerIds from all orders
    const ownerIds = [];
    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.ownerId && !ownerIds.includes(product.ownerId.toString())) {
          ownerIds.push(product.ownerId.toString());
        }
      });
    });

    // Find matching owners
    const owners = await User.find({
      _id: { $in: ownerIds }
    }, { username: 1, email: 1, phone: 1 }).lean();

    // Create owner mapping
    const ownerMap = owners.reduce((map, owner) => {
      map[owner._id.toString()] = owner;
      return map;
    }, {});

    // Enhance orders with owner details
    const enhancedOrders = orders.map(order => {
      const enhancedProducts = order.products.map(product => {
        const owner = ownerMap[product.ownerId?.toString()] || {};
        return {
          ...product,
          ownerDetails: {
            name: owner.username || 'Unknown Owner',
            email: owner.email || '',
            phone: owner.phone || ''
          }
        };
      });

      return {
        ...order,
        products: enhancedProducts
      };
    });

    res.status(200).json({
      success: true,
      message: 'Orders fetched with owner details',
      orders: enhancedOrders
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders with owner details',
      error: err.message
    });
  }
});

module.exports = orderApp;
