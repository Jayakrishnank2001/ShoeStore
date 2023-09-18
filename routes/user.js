const express=require('express')
const router=express.Router()
const userController=require('../controllers/userController')


router.get('/login',userController.loginPage)
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

router.get('/userproduct',userController.productpage)


module.exports=router