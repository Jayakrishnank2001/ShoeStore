const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    couponCode:{
        type:String,
    },
    createdAt:{
        type:Date,
    },
    expiryDate:{
        type:Date,
    },
    purchaseAmount:{
        type:Number,
    },
    price:{
        type:Number,
    },
    description:{
        type:String,
    },
    isActive:{
        type:Boolean,
        default:true
    }
})

module.exports=mongoose.model('Coupon',couponSchema)