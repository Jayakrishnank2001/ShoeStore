const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')
const adminProductController=require('../controllers/adminProductController')
const adminCategoryController=require('../controllers/adminCategoryController')

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


router.get('/adminlogin',adminController.loginpage)
router.post('/adminlogin',adminController.login)

router.get('/dashboard',adminController.dashboard)

router.get('/users',adminController.users)

router.post('/admin/block-user/:userId',adminController.blockUser)
router.post('/admin/unblock-user/:userId',adminController.unblockUser)

router.post('/admin/category-list/:categoryId',adminCategoryController.listCategory)
router.post('/admin/category-unlist/:categoryId',adminCategoryController.unlistCategory)

router.post('/admin/product-list/:productId',adminProductController.listProduct)
router.post('/admin/product-unlist/:productId',adminProductController.unlistProduct)

router.get('/product',adminProductController.product)

router.get('/addproduct',adminProductController.addproduct)
router.post('/addproduct',upload.array('image',3),adminProductController.createProduct)

router.get('/editproduct/:productId',adminProductController.editproduct)

router.get('/category',adminCategoryController.category)

router.get('/addcategory',adminCategoryController.addcategory)
router.post('/addcategory',adminCategoryController.createcategory)


module.exports=router