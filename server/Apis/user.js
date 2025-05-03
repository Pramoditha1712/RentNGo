const exp = require('express');
const userApp = exp.Router();
const User = require('../models/userModel'); // Assuming you have a User model defined

// Get all users
userApp.get('/users', async (req, res) => {
  try {
    const userDetails = await User.find();
    res.send({ message: "User details:", payload: userDetails });
  } catch (err) {
    res.status(500).send({ message: "Error fetching users", error: err.message });
  }
});

// Get user by username (first match only)
userApp.get('/user/name/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });  // Searching by username

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User found", payload: user });
  } catch (err) {
    res.status(500).send({ message: "Error fetching user by username", error: err.message });
  }
});

// Create a new user
userApp.post('/user', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({ message: "User with this email already exists" });
    }

    const newUser = new User(req.body);
    const userDoc = await newUser.save();
    res.send({ message: "User details:", payload: userDoc });
  } catch (err) {
    res.status(500).send({ message: "Internal server error", error: err.message });
  }
});

// Update user details
userApp.put('/user/update', async (req, res) => {
  try {
    const userData = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email: userData.email },
      { $set: { phone: userData.phone, address: userData.address } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User updated", payload: updatedUser });
  } catch (err) {
    res.status(500).send({ message: "Update failed", error: err.message });
  }
});

module.exports = userApp;
