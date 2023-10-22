const Admin=require('../models/admin')
const User=require('../models/users')
const Category=require('../models/category')
const Product=require('../models/product')
const bcrypt=require('bcrypt')

//product table to show all products
exports.product=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=6;
        const skip=(page-1)*limit;

        const products=await Product.find().populate('category')
        .skip(skip)
        .limit(limit)
        .exec();

        const totalCount=await Product.countDocuments();
        const totalPages=Math.ceil(totalCount/limit);
         
        res.render('./admin/adminProduct',{products,totalPages,currentPage:page});
    }catch(error){
        console.error(error);
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//to get the create product page
exports.addproduct=async(req,res)=>{
    try{
        const categories=await Category.find()
        res.render('./admin/addProduct',{categories})
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//creating a new product and store product data to the database
exports.createProduct=async(req,res)=>{
    try{
        const img=[]
        const {productName,category,price,quantity,brand,description,image,size,color,gender}=req.body;
        const categories=await Category.find()
        if(!productName||!category||!price||!quantity||!brand||!description||!size||!color||!gender){
            res.render('./admin/addProduct',{categories,alert:'Please fill all required fields.'})
            return
        }
        //push the image files to the array
        for(const file of req.files){
            img.push(file.filename)
        }
        if(img.length===0){
            res.render('./admin/addProduct',{categories,alert:'Please choose product images'})
            return
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
        await newProduct.save()
        res.redirect('/product?success=true')
    }catch(error){
        console.error(error.message)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//listing product
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
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//unlisting product
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
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//edit product button to redirect to update product page
exports.editproduct=async(req,res)=>{
    try{
        const productId=req.params.productId;
        const product=await Product.findById(productId)
        const categories=await Category.find()
        if(!product){
            return res.status(404).send('Product not found.')
        }
        res.render('./admin/editProduct',{product,categories})
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}

//update a producta details
exports.updateProduct=async(req,res)=>{
    try{ 
        const productId=req.params.productId;
        const product=await Product.findById(productId)
        const categories=await Category.find()
        let img=[]
        const {productName,category,price,quantity,brand,description,image,size,color,gender}=req.body;
        if(!productName||!category||!price||!quantity||!brand||!description||!size||!color||!gender){
            res.render('./admin/editProduct',{product,categories,alert:'Please fill all required fields.'})
            return
        }
        if(req.files.length>0){
            for(const file of req.files){
                img.push(file.filename)
            }
        }else{
            img=product.image
        }
        if(img.length===0){
            res.render('./admin/editProduct',{product,categories,alert:'Please choose product images'})
            return
        }
        // Update the product data in the database using Mongoose
        const updatedProduct=await Product.findByIdAndUpdate(productId,{
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
        },
        {new:true}
        );
        res.redirect('/product?success=false');
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}
