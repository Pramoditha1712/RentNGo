const exp = require('express');
const ownerApp = exp.Router();
const Owner = require('../models/owner');

// Get all rentals
ownerApp.get('/owners', async (req, res) => {
  try {
    const ownerDetails = await Owner.find({});
    res.send({ message: "Owner details:", payload: ownerDetails });
  } catch (err) {
    res.status(500).send({ message: "Error fetching rentals", error: err.message });
  }
});

// Get owner's products by ownerId
ownerApp.get('/ownerproduct/:ownerid', async (req, res) => {
  const ownerId = req.params.ownerid;
  try {
    const ownerProducts = await Owner.find({ ownerId: ownerId });
    res.send({ message: "Owner's products fetched successfully", payload: ownerProducts });
  } catch (err) {
    res.status(500).send({ message: "Error fetching products", error: err.message });
  }
});

// Get owner details by custom ownerId (not MongoDB _id)
ownerApp.get('/owner-by-ownerId/:ownerId', async (req, res) => {
    const ownerId = req.params.ownerId;
    try {
      const ownerDetails = await Owner.find({ ownerId: ownerId });
      
      if (!ownerDetails || ownerDetails.length === 0) {
        return res.status(404).send({ message: "No owners found for this ownerId" });
      }
  
      res.send({ message: "Owner details fetched successfully", payload: ownerDetails });
    } catch (err) {
      res.status(500).send({ message: "Error fetching owner details", error: err.message });
    }
  });
  

// Create rental
ownerApp.post('/owner', async (req, res) => {
  const ownerde = req.body;
  try {
    const newOwner = new Owner(ownerde);
    const ownerDoc = await newOwner.save();
    res.send({ message: "Owner details:", payload: ownerDoc });
  } catch (err) {
    res.status(500).send({ message: "Error saving owner", error: err.message });
  }
});

module.exports = ownerApp;
