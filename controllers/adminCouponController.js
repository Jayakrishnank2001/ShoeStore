const Coupon=require('../models/coupon')

//to create new coupons
exports.createCoupon=async(req,res)=>{
   res.render('./admin/addCoupon')   
}

//admin coupon page
exports.couponPage=async(req,res)=>{
   res.render('./admin/adminCoupon')
}