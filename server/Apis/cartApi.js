const express = require('express');
const cartApp = express.Router();
const Cart = require('../models/cartModel');
const OwnerProduct = require('../models/owner');
const mongoose = require('mongoose');
const User = require('../models/userModel'); // Add this line at the top

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


// PUT /api/cart/update-quantity
cartApp.put('/update-quantity', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Validate request body
  if (!userId || !productId || typeof quantity !== 'number') {
    return res.status(400).json({ message: 'Missing or invalid fields.' });
  }

  try {
    // Find the user's cart and update the quantity of the specific product
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "products.productId": productId },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: 'Cart or product not found.' });
    }

    res.status(200).json({
      message: 'Product quantity updated successfully.',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ➤ Remove a product from cart
// ➤ Remove a product from cart (updated version)
// In your backend route file
cartApp.delete('/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // First remove the item
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { _id: productId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    // If cart is empty after deletion, remove it
    if (cart.products.length === 0) {
      await Cart.deleteOne({ userId });
      return res.status(200).json({ 
        success: true,
        payload: { products: [] }
      });
    }

    // Return the updated cart
    res.status(200).json({ 
      success: true,
      payload: cart
    });

  } catch (err) {
    console.error('Error removing product:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove product',
      error: err.message 
    });
  }
});


// Get cart with owner usernames
cartApp.get('/cart-with-owners/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Get the cart
    const cart = await Cart.findOne({ userId }).lean();
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    // 2. Extract ownerIds from cart products
    const ownerIds = [...new Set(cart.products.map(p => p.ownerId))];
    console.log('Looking for owner IDs:', ownerIds);

    // 3. Find matching owners - special handling for ID mismatch
    const owners = await User.find({
      $or: [
        { _id: { $in: ownerIds } }, // Try direct match first
        // Handle case where IDs are off by one character
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

    console.log('Found owners:', owners);

    // 4. Create flexible mapping
    const ownerMap = owners.reduce((map, owner) => {
      const ownerIdStr = owner._id.toString();
      // Map both full ID and truncated version
      map[ownerIdStr] = owner;
      map[ownerIdStr.substring(0, 23)] = owner;
      return map;
    }, {});

    // 5. Enhance products with owner details
    const enhancedProducts = cart.products.map(product => {
      const productOwnerId = product.ownerId.toString();
      // Try full match first, then truncated match
      const owner = ownerMap[productOwnerId] || ownerMap[productOwnerId.substring(0, 23)] || {};
      
      return {
        ...product,
        ownerDetails: {
          username: owner.username || 'Unknown',
          email: owner.email || '',
          phone: owner.phone || ''
        }
      };
    });

    // 6. Return the enhanced cart
    res.status(200).json({
      success: true,
      message: 'Cart fetched with owner details',
      payload: {
        ...cart,
        products: enhancedProducts
      }
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});



module.exports = cartApp;