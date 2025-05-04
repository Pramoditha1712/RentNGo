const express = require('express');
const orderApp = express.Router();
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const mongoose=require('mongoose')

// Create Order
orderApp.post('/order', async (req, res) => {
  try {
    const userId = req.body.userId;

    // Fetch cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found.' });
    }

    // Fetch user details
    const user = await User.findById(userId).select('name email phone address');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prepare order products and total amount
    const orderProducts = [];
    let totalAmount = 0;

    for (let item of cart.products) {
      const owner = await User.findById(item.ownerId).select('name email');

      orderProducts.push({
        productId: item.productId,
        ownerId: item.ownerId,
        ownerDetails: {
          name: owner?.name || '',
          email: owner?.email || '',
        },
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        imgUrls: item.imgUrls,
      });

      totalAmount += item.price * item.quantity;
    }

    const newOrder = new Order({
      userId: userId,
      userDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
      },
      products: orderProducts,
      totalAmount,
    });

    await newOrder.save();

    // Optionally clear cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


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
        ownerDetails: product.ownerDetails || { // Use embedded details
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
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders',
      error: err.message 
    });
  }
});




// Get all orders containing products owned by a specific owner
orderApp.get('/orders/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Validate ownerId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid owner ID format'
      });
    }

    // Find orders containing products owned by this owner
    const orders = await Order.find({ 'products.ownerId': ownerId.toString() })
      .populate({
        path: 'userId',
        select: 'username email phone'
      })
      .populate({
        path: 'products.productId',
        select: 'name description imgUrls'
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: 'No orders found for your products'
      });
    }

    // Format the response to include only relevant products
    const formattedOrders = orders.map(order => {
      // Filter products to only include those owned by this owner
      const ownerProducts = order.products
        .filter(product => product.ownerId.toString() === ownerId)
        .map(product => ({
          ...product.toObject(),
          productDetails: product.productId ? {
            _id: product.productId._id,
            name: product.productId.name,
            description: product.productId.description,
            imgUrls: product.productId.imgUrls
          } : null
        }));

      return {
        _id: order._id,
        customer: order.userId ? {
          _id: order.userId._id,
          name: order.userId.username,
          email: order.userId.email,
          phone: order.userId.phone
        } : order.userDetails,
        products: ownerProducts,
        totalAmount: ownerProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0),
        paymentStatus: order.paymentStatus,
        orderStatus: order.products[0]?.status || 'Pending',
        orderDate: order.createdAt
      };
    });

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });

  } catch (err) {
    console.error('Error fetching owner orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: err.message
    });
  }
});


module.exports = orderApp;