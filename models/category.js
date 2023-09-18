const mongoose=require('mongoose')

const categorySchema=new mongoose.Schema({
     categoryName:{
        type:String,
     },
     isActive:{
      type:Boolean,
      default:true
     }
})

module.exports=mongoose.model('Category',categorySchema)