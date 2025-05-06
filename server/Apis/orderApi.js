const express = require('express');
const orderApp = express.Router();
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');

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

    // 1) load ordering user
    const user = await User.findById(userId).select('username email phone address');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2) pull their cart
    const cart = await Cart.findOne({ userId });
    if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty or missing' });
    }

    let totalAmount = 0;
    const orderProducts = [];
    const ownerCache = new Map();

    for (const item of cart.products) {
      const price = typeof item.price === 'number'
        ? item.price
        : typeof item.rentPrice === 'number'
          ? item.rentPrice
          : null;
      const name = item.name || item.nameOfProduct;

      if (!item.productId || !name || price == null || typeof item.quantity !== 'number') {
        console.warn('Skipping invalid cart item:', item);
        continue;
      }
      if (price <= 0 || item.quantity <= 0) {
        console.warn('Skipping zero/negative price or qty:', item);
        continue;
      }

      const ownerKey = item.ownerId.toString();
      if (!ownerCache.has(ownerKey)) {
        const owner = await User.findOne({ userid: item.ownerId }).select('username email phone');
        if (!owner) {
          console.warn(`Owner with userid ${item.ownerId} not found—skipping.`);
          continue;
        }
        ownerCache.set(ownerKey, owner);
      }
      const owner = ownerCache.get(ownerKey);

      totalAmount += price * item.quantity;
      orderProducts.push({
        productId: item.productId,
        ownerId: item.ownerId,
        ownerDetails: {
          name: owner.username,
          email: owner.email,
          phone: owner.phone
        },
        name,
        description: item.description || '',
        price,
        quantity: item.quantity,
        imgUrls: item.imgUrls,
        status: 'Pending'
      });
    }

    if (orderProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products to order' });
    }
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid total amount' });
    }

    console.log('→ orderProducts:', orderProducts);
    console.log('→ totalAmount:', totalAmount);

    const receipt = `rcpt_${userId}_${Date.now()}`.slice(0, 40);
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt,
      payment_capture: 1
    });
    if (!razorpayOrder?.id) {
      throw new Error('Razorpay order missing id');
    }

    const newOrder = new Order({
      userId,
      userDetails: {
        name: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address
      },
      products: orderProducts,
      totalAmount: totalAmount,
      paymentStatus: 'Pending',
      razorpayDetails: { orderId: razorpayOrder.id }
    });
    await newOrder.save();

    await Cart.updateOne({ userId }, { $set: { products: [] } });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      razorpayOrder,
      order: newOrder
    });

  } catch (err) {
    console.error('🔥 order creation failed:', err.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: err.message
    });
  }
});

// Get orders for a specific user
orderApp.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const orders = await Order.find({ userId })
      .populate({ path: 'products.productId', select: 'name description imgUrls' })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(200).json({ success: true, orders: [], message: 'No orders found' });
    }

    const formatted = orders.map(o => ({
      ...o.toObject(),
      products: o.products.map(p => ({
        productId: p.productId
          ? {
              _id: p.productId._id,
              name: p.productId.name,
              description: p.productId.description,
              imgUrls: p.productId.imgUrls
            }
          : null,
        ownerDetails: p.ownerDetails || { name: 'Unknown', email: '', phone: '' },
        name: p.name,
        description: p.description,
        price: p.price,
        quantity: p.quantity,
        imgUrls: p.imgUrls,
        status: p.status
      }))
    }));

    res.status(200).json({ success: true, orders: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// Get all orders for a user, enriched with owner details
orderApp.get('/orders-with-owners/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    if (!orders.length) {
      return res.status(200).json({ success: true, orders: [], message: 'No orders found' });
    }

    const ownerIds = new Set();
    orders.forEach(o =>
      o.products.forEach(p => ownerIds.add(p.ownerId.toString()))
    );

    const owners = await User.find(
      { userid: { $in: Array.from(ownerIds) } },
      { username: 1, email: 1, phone: 1, userid: 1 }
    ).lean();

    const ownerMap = owners.reduce((map, o) => {
      map[o.userid.toString()] = o;
      return map;
    }, {});

    const enhanced = orders.map(o => ({
      ...o,
      products: o.products.map(p => {
        const owner = ownerMap[p.ownerId.toString()] || {};
        return {
          ...p,
          ownerDetails: {
            name: owner.username || 'Unknown Owner',
            email: owner.email || '',
            phone: owner.phone || ''
          }
        };
      })
    }));

    res.status(200).json({
      success: true,
      message: 'Orders fetched with owner details',
      orders: enhanced
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
