const exp = require('express')
const ownerApp = exp.Router()
const Owner = require('../models/owner')

// Get all rentals
ownerApp.get('/owners', async (req, res) => {
    try {
        const ownerDetails = await Owner.find({})
        res.send({ message: "Owner details:", payload: ownerDetails })
    } catch (err) {
        res.status(500).send({ message: "Error fetching rentals", error: err.message })
    }
})

ownerApp.get('/ownerproduct/:ownerid', async (req, res) => {
    const ownerId = req.params.ownerid;
    try {
        const ownerProducts = await Owner.find({ ownerId: ownerId });
        res.send({ message: "Owner's products fetched successfully", payload: ownerProducts });
    } catch (err) {
        res.status(500).send({ message: "Error fetching products", error: err.message });
    }
});
  
// create rental
ownerApp.post('/owner',async(req,res)=>{
    const ownerde=req.body
    const  newOwner = new Owner(ownerde)
    const ownerDoc = await newOwner.save()
    res.send({message:"owner details : ",payload:ownerDoc})
})

module.exports = ownerApp