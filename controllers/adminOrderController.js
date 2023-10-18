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
        .sort({ orderDate: -1, _id: 1 })
        .limit(limit)
        .exec();
    
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
        res.render('./admin/adminOrderDetails',{order})
    }catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
 }
}

//to change the order status of a product
exports.orderStatus=async(req,res)=>{
    try {
        const { orderId,status }=req.body;
        const order=await Order.findByIdAndUpdate(orderId,
            {$set:{orderStatus:status}},
            {new:true}
        ).populate('userId');
        const user=order.userId
        if(order.orderStatus==='Refunded'){
        let oldBalance=0
        if(user.wallet.length>0){
            oldBalance=user.wallet[user.wallet.length-1].balance
        }
        const walletData={
            balance:oldBalance+order.totalPrice,
            date:Date.now(),
            creditAmount:order.totalPrice,
            transactionType:'Credit'
        }
        user.wallet.push(walletData)
        await user.save()    
        }
        res.status(200).json(order)
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}
