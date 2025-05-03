const express = require('express');
const cartApp = express.Router();
const Cart = require('../models/cartModel');
const OwnerProduct = require('../models/owner');

// ➤ Get all carts (for testing or admin)
cartApp.get('/carts', async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).send({ message: 'Carts fetched', payload: carts });
  } catch (err) {
    res.status(500).send({ message: 'Failed to fetch carts', error: err.message });
  }
});


// Get cart for specific user
cartApp.get("/cart/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate({
        path: 'products.productId',
        select: 'name description rentPrice imgUrls'
      })
      .populate({
        path: 'products.ownerId',
        select: 'username'
      });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: "Cart not found" 
      });
    }

    // Format the response consistently
    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart: cart
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: err.message
    });
  }
});

// Add item to cart
// In your backend route file
cartApp.post('/cart', async (req, res) => {
  try {
    const { userId, products } = req.body;

    // Validate required fields
    if (!userId || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'userId and products array are required' 
      });
    }

    // Validate each product in the array
    for (const product of products) {
      if (!product.productId || !product.ownerId || !product.name || !product.price) {
        return res.status(400).json({
          success: false,
          error: 'Each product must have productId, ownerId, name, and price'
        });
      }
    }

    // Check if cart exists
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Update existing cart
      for (const newProduct of products) {
        const existingProductIndex = cart.products.findIndex(
          p => p.productId.toString() === newProduct.productId
        );

        if (existingProductIndex >= 0) {
          // Increment quantity if product exists
          cart.products[existingProductIndex].quantity += newProduct.quantity || 1;
        } else {
          // Add new product
          cart.products.push({
            ...newProduct,
            quantity: newProduct.quantity || 1
          });
        }
      }
    } else {
      // Create new cart
      cart = new Cart({
        userId,
        products: products.map(p => ({
          ...p,
          quantity: p.quantity || 1
        }))
      });
    }

    const savedCart = await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: savedCart
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
});



// ➤ Remove a product from cart
cartApp.delete('/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).send({ message: 'Cart not found' });

    cart.products = cart.products.filter((p) => p.productId.toString() !== productId);
    const updatedCart = await cart.save();

    res.status(200).send({ message: 'Product removed', payload: updatedCart });
  } catch (err) {
    res.status(500).send({ message: 'Failed to remove product', error: err.message });
  }
});

// ➤ Clear entire cart (optional)
cartApp.delete('/cart/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.findOneAndUpdate({ userId }, { products: [] });
    res.status(200).send({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).send({ message: 'Failed to clear cart', error: err.message });
  }
});

module.exports = cartApp;