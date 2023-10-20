const Admin=require('../models/admin')
const User=require('../models/users')
const Banner=require('../models/banner')
const Order=require('../models/order')
const bcrypt=require('bcrypt')
const xlsx=require('xlsx')

const newAdmin=new Admin({
    userName:'Jayakrishnan',
    email:'jkrishnan2001@gmail.com',
    password:'jayk@16',
})

//dashboard
exports.dashboard=async(req,res)=>{
    try {
        const usersCount=await User.countDocuments({blocked:false})
        const orderCount=await Order.countDocuments({orderStatus:'Delivered'})
        const revenue=await Order.aggregate([
            {
                $match:{
                    orderStatus:'Delivered',
                },
        },
        {
            $group:{
                _id:null,
                totalRevenue:{$sum:'$totalPrice'},
            },
         },
        ])
        let totalRevenue
        if(revenue.length===0){
            totalRevenue=0
        }else{
            totalRevenue=revenue[0].totalRevenue
        }
        res.render('./admin/dashboard',{usersCount,orderCount,totalRevenue})
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}

//users and blocked users graph
exports.usersGraph=async(req,res)=>{
    try {
        const walletPayment=await Order.countDocuments({paymentMethod:'Wallet'})
        const onlinePayment=await Order.countDocuments({paymentMethod:'Online Payment'})
        const cashOnDelivery=await Order.countDocuments({paymentMethod:'Cash on delivery'})
        res.json({walletPayment,onlinePayment,cashOnDelivery})
    } catch (error) {
       console.error(error)
       res.status(500).send('Internal server error') 
    }
}

//banner page
exports.bannerPage=async(req,res)=>{
    try {
        const banners=await Banner.find()
        res.render('./admin/banner',{banners})
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}

//create new banner page
exports.addBanner=async(req,res)=>{
    res.render('./admin/addBanner')
}

//create banner and store on database
exports.createBanner=async(req,res)=>{
    try {
        const { bannerId,bannerImage }=req.body;
        const existingBanner=await Banner.findOne({ bannerId: {$regex: `^${bannerId}$`, $options: 'i'}})
        if(existingBanner){
            res.render('./admin/addBanner',{alert:'BannerId already exist.'})
            return 
        }
        if(!bannerId){
             res.render('./admin/addBanner',{alert:'Please fill all required fields.'})
             return
        }
        if(!req.file){
            res.render('./admin/addBanner',{alert:'Please select an Image'})
            return
        }
        const newBanner=new Banner({
            bannerId,
            bannerImage:req.file.filename
        })
        await newBanner.save()
        res.redirect('/banners?success=true')
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}

//delete banner
exports.bannerDelete=async(req,res)=>{
    try {
        const bannerId=req.params.bannerId
        await Banner.findByIdAndRemove(bannerId)
        res.redirect('/banners')
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}

exports.loginpage=async(req,res)=>{
    try {
        res.render('./admin/adminLogin')
    } catch (error) {
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

//total revenue graph on the admin dashboard
exports.totalRevenueGraph=async(req,res)=>{
    try{
       const orders = await Order.find({ orderStatus: 'Delivered' });
       const revenueData = orders.reduce((acc, order) => {
        const orderDate = new Date(order.orderDate);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth();
        if (!acc[year]) {
            acc[year] = {};
          }
          if (!acc[year][month]) {
            acc[year][month] = 0;
          }
          acc[year][month] += order.totalPrice;
          return acc;
        }, {});
        res.json(revenueData);        
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal server error')  
    }
}

//sales report
exports.salesReport=async(req,res)=>{
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const orders = await Order.find({
        orderDate: { $gte: startDate, $lte: endDate },
        });
        const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0);
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(orders);
        xlsx.utils.book_append_sheet(wb, ws, 'Sales Report');
        const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
        res.json({ totalRevenue, salesReport: buffer });
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}