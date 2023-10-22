const Admin=require('../models/admin')
const User=require('../models/users')
const Category=require('../models/category')
const bcrypt=require('bcrypt')

//to show category items in the category page
exports.category=async(req,res)=>{
    try{
        const categories=await Category.find()
        res.render('./admin/adminCategory',{categories})
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//rendering to addCategory page
exports.addcategory=async(req,res)=>{
    res.render('./admin/addCategory')
}

//create new category
exports.createcategory=async(req,res)=>{
    try{
        const { categoryName }=req.body;
        const normalizedCategoryName=categoryName.toLowerCase()
        const existingCategory = await Category.findOne({ categoryName: { $regex: `^${normalizedCategoryName}$`, $options: 'i' } });
        if(existingCategory){
            return res.render('./admin/addCategory',{alert:"Category already exist."})
        }
        if(!categoryName){
            return res.render('./admin/addCategory',{alert:'Give a category name.'})
        }
        const newCategory=new Category({
           categoryName:normalizedCategoryName,
        })
        await newCategory.save()
        res.redirect('/category?success=true');
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//list category items
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
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//unlist category items
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
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}
