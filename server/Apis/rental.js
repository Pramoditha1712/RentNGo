const exp = require('express');
const rentalApp = exp.Router();
const Rental = require('../models/rental');

// Get all rentals
rentalApp.get('/rentals', async (req, res) => {
  try {
    const rentalDetails = await Rental.find({});
    res.send({ message: "Rental details:", payload: rentalDetails });
  } catch (err) {
    res.status(500).send({ message: "Error fetching rentals", error: err.message });
  }
});

// Create rental
rentalApp.post('/rental', async (req, res) => {
  try {
    const rentalData = req.body;
    const newRental = new Rental(rentalData);
    const rentalDoc = await newRental.save();
    res.status(201).send({ message: "Rental created", payload: rentalDoc });
  } catch (err) {
    console.error("Error in /rental POST:", err);
    res.status(500).send({ message: "Internal server error", error: err.message });
  }
});

// Get all rentals
rentalApp.get('/rentals', async (req, res) => {
  try {
    const rentalDetails = await Rental.find({});
    res.send({ message: "Rental details:", payload: rentalDetails });
  } catch (err) {
    res.status(500).send({ message: "Error fetching rentals", error: err.message });
  }
});

// Create rental
rentalApp.post('/rental', async (req, res) => {
  try {
    const rentalData = req.body;
    const newRental = new Rental(rentalData);
    const rentalDoc = await newRental.save();
    res.status(201).send({ message: "Rental created", payload: rentalDoc });
  } catch (err) {
    console.error("Error in /rental POST:", err);
    res.status(500).send({ message: "Internal server error", error: err.message });
  }
});


module.exports = rentalApp;
