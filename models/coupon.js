const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    couponCode:{
        type:String,
    },
    expiryDate:{
        type:Date,
    },
    price:{
        type:Number,
    },
    description:{
        type:String,
    }
})

module.exports=mongoose.model('Coupon',couponSchema)