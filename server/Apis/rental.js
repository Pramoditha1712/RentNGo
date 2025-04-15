const exp = require('express')
const rentalApp = exp.Router()
const Rental = require('../models/rental')

// Get all rentals
rentalApp.get('/rentals', async (req, res) => {
    try {
        const rentalDetails = await Rental.find({})
        res.send({ message: "Rental details:", payload: rentalDetails })
    } catch (err) {
        res.status(500).send({ message: "Error fetching rentals", error: err.message })
    }
})

// create rental
rentalApp.post('/rental',async(req,res)=>{
    const rentalde=req.body
    const  newRental = new Rental(rentalde)
    const rentalDoc = await newRental.save()
    res.send({message:"rental details : ",payload:rentalDoc})
})



module.exports = rentalApp