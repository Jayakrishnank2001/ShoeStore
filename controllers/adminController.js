const Admin=require('../models/admin')
const User=require('../models/users')
const Order=require('../models/order')
const bcrypt=require('bcrypt')

const newAdmin=new Admin({
    userName:'Jayakrishnan',
    email:'jkrishnan2001@gmail.com',
    password:'jayk@16',
})

exports.dashboard=async(req,res)=>{
    res.render('./admin/dashboard')
}

exports.loginpage=async(req,res)=>{
    try {
        res.render('./admin/adminLogin')
    } catch (error) {
       console.error(error)
       res.status(500).send('Internal Server Error') 
    }
}

//to show order details on the admin side
exports.orderHistory=async(req,res)=>{
    try {
        const page=parseInt(req.query.page)||1;
        const limit=6;
        const skip=(page-1)*limit;

        const orders=await Order.find().populate('products.productId')
        .skip(skip)
        .limit(limit)
        .exec();

        orders.sort((a, b) => b.orderDate - a.orderDate);
        const totalCount=await Order.countDocuments();
        const totalPages=Math.ceil(totalCount/limit);
         
        res.render('./admin/adminOrder',{orders,totalPages,currentPage:page});
    } catch (error) {
        
    }
}

//to show the order details of products
exports.orderDetails=async(req,res)=>{
    try {
        const orderId=req.params.orderId
        const order=await Order.findById(orderId).populate('products.productId')
        const userId=req.session.userId
        const user=await User.findById(userId)
        res.render('./admin/adminOrderDetails',{user,order})
    }catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
 }
}

exports.users=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=10;
        const skip=(page-1)*limit; 

        const users=await User.find()
        .skip(skip)
        .limit(limit)
        .exec();

        const totalCount=await User.countDocuments();
        const totalPages=Math.ceil(totalCount/limit);

        res.render('admin/adminUser',{users,totalPages,currentPage:page});
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.login=async(req,res)=>{
    const {userName,password}=req.body;
    try{
        const admin=await Admin.findOne({userName})
        if(!admin){
            res.render('./admin/adminLogin',{alert:"Invalid username or password"});
        }else if(admin.password===password && admin.userName===userName){
         req.session.admin=admin;
         res.redirect('/dashboard')
        }else{
            return res.status(401).json({error:'Incorrect password'})
        } 
    }catch(error){
        console.error('Error during admin login',error)
        res.status(500).json({error:'Internal server error'})
    }
}

exports.blockUser=async(req,res)=>{  
    try{
        const userId=req.params.userId;
        const user=await User.findByIdAndUpdate(userId,{blocked:true})
        if(!user){
            return res.status(404).json({error:'User not found'})
        }
        res.redirect('/users')
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error')
    }
}

exports.unblockUser=async(req,res)=>{
    try{ 
        const userId=req.params.userId;
        const user=await User.findByIdAndUpdate(userId,{blocked:false})
        if(!user){
            return res.status(404).json({error:'User not found'})
        }
        res.redirect('/users')
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error')
    }
}

//to logout the admin
exports.adminlogout=async(req,res)=>{
    try{
        req.session.destroy()
        res.redirect('/adminlogin')
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error')
    }
}

//to change the order status of a product
exports.orderStatus=async(req,res)=>{
    try {
        const { orderId,status }=req.body;
        console.log(orderId,status,"dfjkdjkfdkjfdkfkd")
        const updatedOrder=await Order.findByIdAndUpdate(orderId,
            {$set:{orderStatus:status}},
            {new:true}
        );
        res.status(200).json(updatedOrder)
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}

