const userApp = require('./Apis/user')
const cors=require('cors')

const exp=require("express")
const app=exp()
app.use(exp.json())
app.use(cors())
require('dotenv').config()
const mongoose=require("mongoose")
const rentalApp = require('./Apis/rental')
const ownerApp = require('./Apis/owner')
const cartApp = require('./Apis/cartApi')
const orderApp=require('./Apis/orderApi')

const port=process.env.PORT || 7800

mongoose.connect(process.env.DBURL)
.then(()=>app.listen(port,()=>console.log(`server listening on port ${port}...`)))
.catch(err=>console.log("error in DB connection",err))


app.use('/user-api',userApp)
app.use('/rental-api',rentalApp)
app.use('/owner-api',ownerApp)
app.use('/cart-api',cartApp)
app.use('/order-api',orderApp)