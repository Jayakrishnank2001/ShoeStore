const express=require('express')
const router=express.Router()
const userController=require('../controllers/userController')
const userAuth=require('../middlewares/userAuth')

router.get('/login',userAuth.yesSession,userController.loginPage)
router.post('/login',userController.userlogin)

router.get('/otp',userController.otppage)
router.post('/otp',userController.otpverify)

router.get('/forgototp',userController.forgototppage)
router.post('/forgototp',userController.forgototpverify)

router.get('/forgot',userController.forgotPage)
router.post('/forgot',userController.emailverify)

router.get('/signup',userController.signupPage)
router.post('/signup',userController.registerUser)

router.get('/resetpassword',userController.resetpassword)
router.post('/resetpassword',userController.reset)

//router.get('/resendloginOTP',userController.OTPresend)

router.get('/products',userController.productspage)

router.get('/userproduct/:productId',userController.productpage)

router.get('/cart',userAuth.noSession,userController.cartPage)
router.get('/addcart/:productId',userAuth.noSession,userController.addToCart)

router.get('/removecart/:productId',userAuth.noSession,userController.removeFromCart)

router.get('/checkout',userAuth.noSession,userController.checkoutPage)

router.get('/profile',userAuth.noSession,userController.userprofile)

router.get('/orders',userAuth.noSession,userController.orderHistory)

router.post('/logout',userAuth.noSession,userController.userLogout)
module.exports=router