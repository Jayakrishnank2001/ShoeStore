const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')
const adminProductController=require('../controllers/adminProductController')
const adminCategoryController=require('../controllers/adminCategoryController')
const adminOrderController=require('../controllers/adminOrderController')
const adminCouponController=require('../controllers/adminCouponController')
const adminAuth=require('../middlewares/adminAuth')

const multer = require('multer')
const path = require('path');
const admin = require('../models/admin')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, path.join(__dirname,"../public/uploads"), function(error, success) {
        if (error) {
          console.log(error);
        }
      });
    },
    filename: function(req, file, cb) {
      const name = Date.now()+"-"+file.originalname;
      cb(null, name, function(error, success) {
        if (error) {
          console.log(error);
        }
      });
    }
});

const upload = multer({ storage: storage });


router.get('/adminlogin',adminAuth.yesSession,adminController.loginpage)
router.post('/adminlogin',adminController.login)

router.get('/dashboard',adminAuth.noSession,adminController.dashboard)
router.get('/payment-method',adminAuth.noSession,adminController.usersGraph)
router.get('/total-revenue',adminAuth.noSession,adminController.totalRevenueGraph)
router.post('/generate-sales-report',adminAuth.noSession,adminController.salesReport)

router.get('/users',adminAuth.noSession,adminController.users)
router.get('/admin/block-user/:userId',adminAuth.noSession,adminController.blockUser)
router.get('/admin/unblock-user/:userId',adminAuth.noSession,adminController.unblockUser)

router.get('/product',adminAuth.noSession,adminProductController.product)
router.get('/admin/product-list/:productId',adminAuth.noSession,adminProductController.listProduct)
router.get('/admin/product-unlist/:productId',adminAuth.noSession,adminProductController.unlistProduct)
router.get('/addproduct',adminAuth.noSession,adminProductController.addproduct)
router.post('/addproduct',upload.array('image',5),adminProductController.createProduct)
router.get('/editproduct/:productId',adminAuth.noSession,adminProductController.editproduct)
router.post('/editproduct/:productId',upload.array('image',5),adminProductController.updateProduct)

router.get('/category',adminAuth.noSession,adminCategoryController.category)
router.get('/addcategory',adminAuth.noSession,adminCategoryController.addcategory)
router.post('/addcategory',adminCategoryController.createcategory)
router.get('/admin/category-list/:categoryId',adminAuth.noSession,adminCategoryController.listCategory)
router.get('/admin/category-unlist/:categoryId',adminAuth.noSession,adminCategoryController.unlistCategory)

router.get('/banners',adminAuth.noSession,adminController.bannerPage)
router.get('/addbanner',adminAuth.noSession,adminController.addBanner)
router.post('/addbanner',upload.single('bannerImage'),adminAuth.noSession,adminController.createBanner)
router.get('/bannerDelete/:bannerId',adminAuth.noSession,adminController.bannerDelete)

router.get('/adminorder',adminAuth.noSession,adminOrderController.orderHistory)
router.get('/adminOrderdetails/:orderId',adminAuth.noSession,adminOrderController.orderDetails)
router.post('/update-order-status',adminAuth.noSession,adminOrderController.orderStatus)

router.get('/addcoupon',adminAuth.noSession,adminCouponController.createCoupon)
router.post('/addcoupon',adminAuth.noSession,adminCouponController.newCoupon)
router.get('/couponDelete/:couponId',adminAuth.noSession,adminCouponController.deleteCoupon)
router.get('/coupon',adminAuth.noSession,adminCouponController.couponPage)
router.get('/editCoupon/:couponId',adminAuth.noSession,adminCouponController.couponEditPage)
router.post('/editcoupon/:couponId',adminAuth.noSession,adminCouponController.updateCoupon)

router.post('/adminlogout',adminController.adminlogout)



module.exports=router