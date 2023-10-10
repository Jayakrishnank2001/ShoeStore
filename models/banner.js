const mongoose=require('mongoose')

const bannerSchema=new mongoose.Schema({
    bannerId:{
        type:String,
    },
    bannerImage:{
        type:String
    }
})

module.exports=mongoose.model('Banner',bannerSchema)