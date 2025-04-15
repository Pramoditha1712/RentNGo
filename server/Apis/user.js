const exp=require('express')
const userApp=exp.Router()
const User=require('../models/userModel')

userApp.get('/users',async(req,res)=>{
    const userDetails = await User.find()
    res.send({message:"details are:",payload:userDetails})
})


userApp.post('/user',async(req,res)=>{
    const userde=req.body
    const  newUser = new User(userde)
    // console.log(userde)
    const userDoc = await newUser.save()
    res.send({message:"user details : ",payload:userDoc})
})

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

module.exports=userApp