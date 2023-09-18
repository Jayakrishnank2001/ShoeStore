const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
    productName : {
        type: String,
        required: true,
    },
    category : {
        type: String,
        // required: true,
    },
    price : {
        type : Number,
        // require : true
    },
    quantity : {
        type : String,
        // require : true
    },
    brand : {
        type : String,
        // require : true
    },
    description : {
        type : String,
        // require : true
    },
    image : {
        type : [String],
        // require : true
    },
    size : {
        sizes: [{ type: Number, enum: [6, 7, 8, 9, 10] }],
    },
    color : {
        type :String
    },
    gender : {
        type : String,
        // require : true
    },
    isActive : {
        type: Boolean,
        default:true
    },
   
})

module.exports=mongoose.model('Product',productSchema)