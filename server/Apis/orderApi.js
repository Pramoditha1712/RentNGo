const express = require('express');
const orderApp = express.Router();
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

// ➤ Place an order from the cart
orderApp.post('/order', async (req, res) => {
  try {
    const { userId, address } = req.body;
    const cart = await Cart.findOne({ userId }).populate('products.productId').exec();

    if (!cart || cart.products.length === 0) {
      return res.status(400).send({ message: 'Cart is empty' });
    }

    const products = cart.products.map((product) => ({
      productId: product.productId._id,
      ownerId: product.productId.ownerId,
      name: product.productId.nameOfProduct,
      description: product.productId.description,
      price: product.productId.rentPrice,
      quantity: product.quantity,
      imgUrls: product.productId.imgUrls,
    }));

    const totalAmount = products.reduce((total, item) => total + item.price * item.quantity, 0);

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      address,
      status: 'pending',
    });

    const savedOrder = await newOrder.save();

    await Cart.findOneAndUpdate({ userId }, { products: [] });

    res.status(201).send({ message: 'Order placed successfully', payload: savedOrder });
  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).send({ message: 'Failed to place order', error: err.message });
  }
});

// ➤ Get all orders of a user
orderApp.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).send({ message: 'User orders fetched', payload: orders });
  } catch (err) {
    res.status(500).send({ message: 'Failed to fetch user orders', error: err.message });
  }
});


// ➤ Get all orders for a specific owner (based on ownerId in products)

orderApp.get('/orders/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = new ObjectId(req.params.ownerId); // ✅ fix

    const allOrders = await Order.find({ 'products.ownerId': ownerId }).sort({ createdAt: -1 });

    const filteredOrders = allOrders.map(order => {
      const filteredProducts = order.products.filter(p => p.ownerId.toString() === ownerId.toString());
      return {
        ...order.toObject(),
        products: filteredProducts,
      };
    });

    res.status(200).send({ message: 'Owner orders fetched', payload: filteredOrders });
  } catch (err) {
    res.status(500).send({ message: 'Failed to fetch owner orders', error: err.message });
  }
});

// PUT /order/:orderId/status
orderApp.put('/order/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ message: 'Invalid status value' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).send({ message: 'Order not found' });
    }

    res.send({ message: 'Order status updated', payload: updatedOrder });
  } catch (err) {
    res.status(500).send({ message: 'Failed to update order status', error: err.message });
  }
});


module.exports = orderApp;
