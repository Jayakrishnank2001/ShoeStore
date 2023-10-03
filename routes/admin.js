const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')
const adminProductController=require('../controllers/adminProductController')
const adminCategoryController=require('../controllers/adminCategoryController')
const adminAuth=require('../middlewares/adminAuth')

const multer = require('multer')
const path = require('path');

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

router.get('/users',adminAuth.noSession,adminController.users)

router.get('/admin/block-user/:userId',adminAuth.noSession,adminController.blockUser)
router.get('/admin/unblock-user/:userId',adminAuth.noSession,adminController.unblockUser)

router.get('/admin/category-list/:categoryId',adminAuth.noSession,adminCategoryController.listCategory)
router.get('/admin/category-unlist/:categoryId',adminAuth.noSession,adminCategoryController.unlistCategory)

router.get('/admin/product-list/:productId',adminAuth.noSession,adminProductController.listProduct)
router.get('/admin/product-unlist/:productId',adminAuth.noSession,adminProductController.unlistProduct)

router.get('/product',adminAuth.noSession,adminProductController.product)

router.get('/addproduct',adminAuth.noSession,adminProductController.addproduct)
router.post('/addproduct',upload.array('image',3),adminProductController.createProduct)

router.get('/editproduct/:productId',adminAuth.noSession,adminProductController.editproduct)
router.post('/editproduct/:productId',upload.array('image',3),adminProductController.updateProduct)

router.get('/category',adminAuth.noSession,adminCategoryController.category)

router.get('/addcategory',adminAuth.noSession,adminCategoryController.addcategory)
router.post('/addcategory',adminCategoryController.createcategory)

router.get('/adminorder',adminAuth.noSession,adminController.orderHistory)

router.post('/adminlogout',adminController.adminlogout)





module.exports=router