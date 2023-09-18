const Admin=require('../models/admin')
const User=require('../models/users')
const Category=require('../models/category')
const bcrypt=require('bcrypt')

exports.category=async(req,res)=>{
    try{
        const categories=await Category.find()
        res.render('./admin/adminCategory',{categories})
    }catch(error){
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}

exports.addcategory=async(req,res)=>{
    res.render('./admin/addCategory')
}

exports.createcategory=async(req,res)=>{
    try{
        const { categoryName }=req.body;
        const existingCategory=await Category.findOne({categoryName})
        if(existingCategory){
            return res.render('./admin/addCategory',{alert:"Category already exist."})
        }
        if(!categoryName){
            return res.render('./admin/addCategory',{alert:'Give a category name.'})
        }
        const newCategory=new Category({
           categoryName,
        })
        await newCategory.save()
        res.redirect('/category')
    }catch(error){
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}
exports.listCategory=async(req,res)=>{
    try{
        const categoryId=req.params.categoryId;
        const category=await Category.findByIdAndUpdate(categoryId,{isActive:false})
        if(!category){
            return res.status(404).json({error:'Category not found.'})
        }
        res.redirect('/category')
    }catch(error){
        console.error(error)
        res.status(500).send('Internal server error')
    }
}
exports.unlistCategory=async(req,res)=>{
    try{
        const categoryId=req.params.categoryId;
        const category=await Category.findByIdAndUpdate(categoryId,{isActive:true})
        if(!category){
            return res.status(404).json({error:'Category not found.'})
        }
        res.redirect('/category')
    }catch(error){
        console.error(error)
        res.status(500).send('Internal server error')
    }
}
