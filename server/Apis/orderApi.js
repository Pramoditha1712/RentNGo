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
    // console.error(err);
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
    // console.error('Error fetching orders:', err);
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

    // 1. Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // 2. Get all orders for the user
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

    // 3. Extract all unique ownerIds from all orders
    const ownerIds = [];
    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.ownerId && !ownerIds.includes(product.ownerId.toString())) {
          ownerIds.push(product.ownerId.toString());
        }
      });
    });

    // console.log('Looking for owner IDs:', ownerIds);

    // 4. Find matching owners with flexible ID matching
    const owners = await User.find({
      $or: [
        { _id: { $in: ownerIds } }, // Exact match
        // Flexible matching for potential ID inconsistencies
        {
          $expr: {
            $let: {
              vars: {
                ownerIdStr: { $toString: "$_id" }
              },
              in: {
                $or: ownerIds.map(id => ({
                  $eq: [
                    { $substrCP: ["$$ownerIdStr", 0, 23] },
                    id.toString().substring(0, 23)
                  ]
                }))
              }
            }
          }
        }
      ]
    }, { username: 1, email: 1, phone: 1 }).lean();

    // console.log('Found owners:', owners);

    // 5. Create owner mapping with flexible matching
    const ownerMap = owners.reduce((map, owner) => {
      const ownerIdStr = owner._id.toString();
      // Map both full ID and truncated version
      map[ownerIdStr] = owner;
      map[ownerIdStr.substring(0, 23)] = owner;
      return map;
    }, {});

    // 6. Enhance orders with owner details
    const enhancedOrders = orders.map(order => {
      const enhancedProducts = order.products.map(product => {
        const productOwnerId = product.ownerId?.toString() || '';
        // Try full match first, then truncated match
        const owner = ownerMap[productOwnerId] || 
                     ownerMap[productOwnerId.substring(0, 23)] || {};
        
        return {
          ...product,
          ownerDetails: {
            name: owner.username || product.ownerDetails?.name || 'Unknown Owner',
            email: owner.email || product.ownerDetails?.email || '',
            phone: owner.phone || product.ownerDetails?.phone || ''
          }
        };
      });

      return {
        ...order,
        products: enhancedProducts
      };
    });

    // 7. Return the enhanced orders
    res.status(200).json({
      success: true,
      message: 'Orders fetched with owner details',
      orders: enhancedOrders
    });

  } catch (err) {
    // console.error('Error fetching orders with owners:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders with owner details',
      error: err.message
    });
  }
});


module.exports = orderApp;