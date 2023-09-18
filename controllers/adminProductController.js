const Admin=require('../models/admin')
const User=require('../models/users')
const Product=require('../models/product')
const bcrypt=require('bcrypt')

exports.product=async(req,res)=>{
    try{
        const products=await Product.find();
        res.render('./admin/adminProduct',{products})
    }catch(error){
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.addproduct=async(req,res)=>{
    res.render('./admin/addProduct')
}

exports.editproduct=async(req,res)=>{
    try{
        const productId=req.params.productId;
        const product=await Product.findById(productId)
        if(!product){
            return res.status(404).send('Product not found.')
        }
        res.render('./admin/editProduct',{product})
    }catch(error){
        console.error(error)
        res.status(500).send('Internal server error');
    }
}

exports.createProduct=async(req,res)=>{
    try{
        let img=[]
        const {productName,category,price,quantity,brand,description,image,size,color,gender}=req.body;
        for(let file of req.files){
            img.push(file.filename)
        }
        const newProduct=new Product({
            productName,
            category,
            price,
            quantity,
            brand,
            description,
            image:img,
            size,
            color,
            gender
        })
        if(!productName||!category||!price||!quantity||!brand||!description||!size||!color||!gender){
            return res.render('./admin/addProduct',{alert:'Please fill in all required fields.'})
        }
        await newProduct.save()
        res.redirect('/product')
    }catch(error){
        console.error(error.message)
        res.send(error)
        res.status(500).send('Internal server Error')
    }
}

exports.listProduct=async(req,res)=>{
    try{
        const productId=req.params.productId
        const product=await Product.findByIdAndUpdate(productId,{isActive:false})
        if(!product){
            return res.status(404).json({error:'Product not found'})
        }
        res.redirect('/product')
    }catch(error){
        console.error(error);
        res.status(500).send('Internal server error')
    }
}

exports.unlistProduct=async(req,res)=>{
    try{
        const productId=req.params.productId
        const product=await Product.findByIdAndUpdate(productId,{isActive:true})
        if(!product){
            return res.status(404).json({error:'Product not found'})
        }
        res.redirect('/product')
    }catch(error){
        console.error(error);
        res.status(500).send('Internal server error')
    }
}

