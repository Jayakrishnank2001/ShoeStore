const Coupon=require('../models/coupon')

//coupon create page
exports.createCoupon=async(req,res)=>{
   res.render('./admin/addCoupon')   
}

//admin coupon page
exports.couponPage=async(req,res)=>{
   try{
      const coupons=await Coupon.find()
      res.render('./admin/adminCoupon',{coupons})
   }catch{
      console.error(error)
      res.redirect('/error?err=' + encodeURIComponent(error.message));
   }
}

//create new coupon 
exports.newCoupon=async(req,res)=>{
   try {
     const { couponCode,createdAt,expiryDate,purchaseAmount,price,description }=req.body
     if(!couponCode||!createdAt||!expiryDate||!purchaseAmount||!price||!description){
      res.render('./admin/addCoupon',{alert:'Please fill all required fields.'})
      return
     }
     const newCoupon=new Coupon({
      couponCode,
      createdAt,
      expiryDate,
      price,
      purchaseAmount,
      description
     })
     await newCoupon.save()
     res.redirect('/coupon?success=true')
   } catch (error) {
      console.error(error)
      res.redirect('/error?err=' + encodeURIComponent(error.message));
   }
}

//delete coupon
exports.deleteCoupon=async(req,res)=>{
   try {
      const couponId=req.params.couponId
      await Coupon.findByIdAndRemove(couponId)
      res.redirect('/coupon')
   } catch (error) {
      console.error(error)
      res.redirect('/error?err=' + encodeURIComponent(error.message));
   }
}

//coupon edit page
exports.couponEditPage=async(req,res)=>{
   try {
      const couponId=req.params.couponId
      const coupon=await Coupon.findById(couponId)
      res.render('./admin/editCoupon',{coupon})
   } catch (error) {
      console.error(error)
      res.redirect('/error?err=' + encodeURIComponent(error.message));
   }
}

//update coupon
exports.updateCoupon=async(req,res)=>{
   try {
      const couponId=req.params.couponId
      const coupon=await Coupon.findById(couponId)
      const { couponCode,createdAt,expiryDate,purchaseAmount,price,description }=req.body
      if(!couponCode||!createdAt||!expiryDate||!purchaseAmount||!price||!description){
         res.render('./admin/editCoupon',{coupon,alert:'Please fill all required fields.'})
         return
      }
      await Coupon.findByIdAndUpdate(couponId,{
         couponCode,
         createdAt,
         expiryDate,
         price,
         purchaseAmount,
         description
      },
      {new:true}
      )
      res.redirect('/coupon?success=false')
   } catch (error) {
      console.error(error)
      res.redirect('/error?err=' + encodeURIComponent(error.message));
   }
}