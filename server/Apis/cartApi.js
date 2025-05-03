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

// ➤ Get cart by userId
cartApp.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).send({ message: 'Cart not found' });

    res.status(200).send({ message: 'Cart fetched', payload: cart });
  } catch (err) {
    res.status(500).send({ message: 'Error fetching cart', error: err.message });
  }
});

// ➤ Add product to cart
cartApp.post('/cart', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Find the product by ID
    const product = await OwnerProduct.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });

    const productInfo = {
      productId: product._id,
      ownerId: product.ownerId,
      name: product.nameOfProduct,
      description: product.description,
      price: product.rentPrice,
      quantity: 1,
      imgUrls: product.imgUrls,
    };

    if (cart) {
      const exists = cart.products.some((p) => p.productId.toString() === productId);
      if (exists) {
        return res.status(400).send({ message: 'Product already in cart' });
      }
      cart.products.push(productInfo);
    } else {
      cart = new Cart({ userId, products: [productInfo] });
    }

    const savedCart = await cart.save();
    res.status(200).send({ message: 'Product added to cart', payload: savedCart });
  } catch (err) {
    res.status(500).send({ message: 'Failed to add to cart', error: err.message });
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
