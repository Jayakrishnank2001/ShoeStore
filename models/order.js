const mongoose=require('mongoose')

const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        orderQuantity:{
            type:Number
        },
        productTotalPrice:{
            type:Number,
        }
    }],
    address:[{
        firstName:{
            type:String
        },
        lastName:{
            type:String
        },
        address:{
            type:String
        },
        town:{
            type:String
        },
        pincode:{
            type:Number
        },
        district:{
            type:String
        },
        state:{
            type:String
        },
        country:{
            type:String
        },
        mobileNumber:{
            type:Number
        }
    }],
    totalPrice:{
        type:Number
    },
    discountAmount:{
        type:Number
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    orderStatus:{
        type:String
    },
    paymentMethod:{
        type:String
    },
    returned:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('Order',orderSchema)