const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    mobileNumber:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    blocked:{
        type:Boolean,
        default:false
    },
    confirmPassword:{
        type:String,
    },
    otp:{
        type:String,
    },
    cart:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            default:1
        }
    }]
});

module.exports=mongoose.model('User',userSchema)