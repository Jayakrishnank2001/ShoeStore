const Order=require('../models/order')
const Product=require('../models/product')
const User=require('../models/users')


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
        console.error(error)
        res.status(500).send('Internal Server Error')
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

//to change the order status of a product
exports.orderStatus=async(req,res)=>{
    try {
        const { orderId,status }=req.body;
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