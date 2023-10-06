const User=require('../models/users')
const Product=require('../models/product')
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const crypto=require('crypto')
const randomstring=require('randomstring')
const { log } = require('console')
const { product } = require('./adminProductController')
const Category = require('../models/category')
const Order=require('../models/order')
const Razorpay=require('razorpay')

const razorpay=new Razorpay({
  key_id:process.env.RAZORPAY_ID_KEY,
  key_secret:process.env.RAZORPAY_SECRET_KEY,
});

exports.homePage=async(req,res)=>{
  try {
    const products=await Product.find({brand:'Nike',isActive:true}).limit(8)
    res.render('./user/home',{products})
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

exports.loginPage=async(req,res)=>{
    res.render('./login/userLogin')
}

//user profile page
exports.userprofile=async(req,res)=>{
  try {
    const userId=req.session.userId
    const user=await User.findById(userId)
    res.render('./user/userprofile',{user})
  }catch(error){
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

exports.passwordChange=async(req,res)=>{
  res.render('./user/changepassword')
}

exports.checkoutPage=async(req,res)=>{
  try {
    const userId=req.session.userId
    const cartTotal=req.session.totalSum
    const user=await User.findById(userId)
    const defaultAddress = user.userAddress.find((address) => address.isDefault === true);
    res.render('./user/checkout',{user,defaultAddress,cartTotal})
  } catch (error) {
    
  }
}

exports.otppage=async(req,res)=>{
  res.render('./login/userloginotp')
}

exports.userAddress=async(req,res)=>{
  const userId=req.session.userId
  const user= await User.findById(userId);
  const addressDetails =user.userAddress;
  res.render('./user/address',{addressDetails})
}

exports.forgotPage=async(req,res)=>{
  res.render('./login/forgotpassword')
}

exports.signupPage=async(req,res)=>{
  res.render('./login/usersignup')
}

exports.forgototppage=async(req,res)=>{
  res.render('./login/forgototp')
}

exports.resetpassword=async(req,res)=>{
  res.render('./login/resetpassword')
} 

//to show order history on the user side
exports.orderDetails=async(req,res)=>{
  try {
    const orderId=req.params.orderId
    const order=await Order.findById(orderId).populate('products.productId')
    const userId=req.session.userId
    const user=await User.findById(userId)
    res.render('./user/orderDetails',{user,order})
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

exports.orderHistory=async(req,res)=>{
  try {
    const page=parseInt(req.query.page)||1;
    const limit=6;
    const skip=(page-1)*limit;

    const userId=req.session.userId
    const orders = await Order.find({ userId: userId }).populate('products.productId')
    .skip(skip)
    .limit(limit)
    .exec();

    orders.sort((a, b) => b.orderDate - a.orderDate);
    const totalCount=await Order.countDocuments({userId:userId})
    const totalPages=Math.ceil(totalCount/limit);
    res.render('./user/orders',{orders,totalPages,currentPage:page})
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error')
  }
}
//to show products on the cart page
exports.cartPage=async(req,res)=>{
  try {
    const userId=req.session.userId;
    const user = await User.findById(userId).populate('cart.productId').exec();
    // const user=await User.findById(userId).populate('cart.productId');
    const cartItems=user.cart.map(item=>{
      return{
        product:item.productId,
        totalPrice:item.totalPrice,
        quantity:item.quantity,
      };
    });

    const totalSum = user.cart.reduce((sum,cartItems)=>{
      return sum + cartItems.totalPrice
  },0)
    res.render('./user/cart',{cartItems,totalSum})
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//to show the product details
exports.productpage=async(req,res)=>{
  try {
    const productId=req.params.productId;
    const product=await Product.findById(productId)
    res.render('./user/product',{product})
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
  
}

//to show products page for men
exports.productspage = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;
      const categoryId = req.query.categoryId; // Retrieve categoryId from query parameters
      const { priceFrom, priceTo } = req.query; // Retrieve priceFrom and priceTo from query parameters
      const gender = req.query.gender || ['men', 'women']; // Use an array to select both men and women
      const searchQuery=req.query.searchQuery || '';

      const categories = await Category.find({ isActive: true });
      const categoryIds = categories.map((category) => category._id);

      let productsQuery = {isActive: true,gender:gender,category: categoryId ? categoryId : { $in: categoryIds }};

      // Add price range filter if priceFrom and priceTo are provided
      if (priceFrom && priceTo) {
          productsQuery.price = { $gte: priceFrom, $lte: priceTo };
      }

      if (searchQuery) {
        // Use a regular expression to perform a case-insensitive search on productName and description
        productsQuery.$or = [
          { productName: { $regex: searchQuery, $options: 'i' } },
          { brand: { $regex: searchQuery, $options: 'i' } },
        ];
      }
  
      const products = await Product.find(productsQuery)
          .populate('category')
          .skip(skip)
          .limit(limit)
          .exec();
      const totalCount = await Product.countDocuments(productsQuery);
      const totalPages = Math.ceil(totalCount / limit);

      res.render("./user/shop", {products,categories,currentPage: page,totalPages,priceFrom,priceTo,gender,searchQuery});
   } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error.");
  }
};

//set email to send OTP
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: 'jayk16122001@gmail.com',
      pass: 'bxtnutkzabiwyqwf',
    },
});

//to generate the otp
const generateOTP = () => {
  return randomstring.generate({
    length: 6,
    charset: 'numeric',
  });
};

//sending OTP by email
const sendOTPByEmail = (email, otp) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'jayk16122001@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for registration: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log('OTP sent via email:', info.response);
        resolve();
      }
    });
  });
};

//registering user
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, email, password, confirmPassword } = req.body;
    const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    if(!firstName||!lastName||!mobileNumber||!email||!password||!confirmPassword){
      return res.render('./login/usersignup',{alert:'All fields are required.'})
    }
    if(password.length<6){
      return res.render('./login/usersignup',{alert:"Password must be at least 6 characters long"})
    }
    if(password!==confirmPassword){
      return res.render('./login/usersignup',{alert:"Password do not match"});
    }
    const existingUser=await User.findOne({email})
    if(existingUser){
      return res.render('./login/usersignup',{alert:"Email already exist."})
    }
    const otp = generateOTP();

    req.session.email = email;
    req.session.otp = otp;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (specialCharacterRegex.test(password)){
      req.session.userData = new User({
        firstName,
        lastName,
        mobileNumber,
        email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      });
      await sendOTPByEmail(email, otp);
      res.redirect('/otp')
    }else{
      return res.render('./login/usersignup',{alert:"Password must include at least one special character."});
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//verifying OTP after verify the OTP store user's data to the database 
exports.otpverify=async (req,res)=>{
    try{
        const enteredOTP=req.body.otp;
        const generatedOTP=req.session.otp;
        console.log(enteredOTP,generatedOTP)
        if(enteredOTP!==generatedOTP){
            return res.render('./login/userloginotp',{alert:'Invalid OTP'})
        }
        const  {firstName,lastName,mobileNumber,email,password}=req.session.userData;
        const newUser=new User({
            firstName,
            lastName,
            mobileNumber,
            email,
            password
        });
        await newUser.save();
        delete req.session.otp;
        delete req.session.userData;
        res.redirect('/login')
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error')
    }
}

//verifying email to send OTP 
exports.emailverify=async(req,res)=>{
    try{
        const  {email}=req.body
        const user=await User.findOne({email})
        if(!user){
            res.render('./login/forgotpassword',{alert: "Enter valid Email"})
        } else if(user.email===email){
         req.session.email=email
         const otp=generateOTP();
         req.session.otp=otp;
         await sendOTPByEmail(email,otp);
         res.redirect('/forgototp')
        }else{
          return res.status(402).json({error:'incorrect email'})
        }
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

//reset password
exports.reset = async (req, res) => {
  try {
    const email = req.session.email;
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.render('./login/resetpassword', { alert: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.render('./login/resetpassword', { alert: "Password must be at least 6 characters long" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    user.password = hashedPassword;
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//user logging in using email and password
exports.userlogin=async(req,res)=>{
  const {email,password}=req.body
  try{
      const user=await User.findOne({email})
      const passwordMatch=await bcrypt.compare(password,user.password)
      if(!user){
        res.render('./login/userLogin',{alert:"Invalid Email or Password."})
      }
      if(user.blocked===true){
        return res.render('./login/userlogin',{alert:"Can't access your account."})
      }
      else if(user.email===email && passwordMatch){
        req.session.userId=user._id;
        res.redirect('/')
      }else{
        return res.render('./login/userLogin',{alert:'Invalid Password or Email.'})
      }
  }catch(error){
    console.log('Error during user login',error)
    res.status(500).json({error:'Internal Server Error'})
  }
}

//verifying OTP to reset password after enter the correct OTP redirect to the reset password page
exports.forgototpverify=async(req,res)=>{
  try{
    const enteredOTP=req.body.otp;
    const generatedOTP=req.session.otp;
    if(enteredOTP!==generatedOTP){
        return res.render('./login/forgototp',{alert:'Invalid OTP'})
    }
    delete req.session.otp;
    res.redirect('/resetpassword')
  }catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error')
}
}

//product add to the cart
exports.addToCart=async(req,res)=>{
  try {
    const productId=req.params.productId;
    const product = await Product.findById(productId);
    let userId=req.session.userId;
    const user=await User.findOne({_id:userId,'cart.productId':productId});
    if(user){
      res.json({data:'Already added this product to cart.'});
    }else{
      let user=await User.findByIdAndUpdate(
          userId,
          {$push:{cart:{productId:productId,quantity:1,totalPrice:product.price}}},
          {new:true}
      );
      res.json({data:'Product added to the cart successfully'})
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//remove product from the cart
exports.removeFromCart=async(req,res)=>{
  try {
    const userId=req.session.userId
    const productId=req.params.productId
    const user=await User.findByIdAndUpdate(userId,
      {$pull:{cart:{productId}}},
      {new:true}
      );
    res.json({data:'Product removed from the cart successfully'})
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//User logout
exports.userLogout=async(req,res)=>{
  try {
    req.session.destroy()
    res.redirect('/login')
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//change User password on the user profile
exports.changePassword=async(req,res)=>{
  try {
    const { currentPassword,newPassword,confirmPassword } =req.body;
    const userId=req.session.userId
    const user=await User.findById(userId)
    const passwordMatch=await bcrypt.compare(currentPassword,user.password)
    if(!passwordMatch){
      return res.render('./user/changepassword',{alert:"Password is not correct"})
    }
    if (newPassword !== confirmPassword) {
      return res.render('./user/changepassword', { alert: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.render('./user/changepassword', { alert: "Password must be at least 6 characters long" });
    }
    const hashedPassword=await bcrypt.hash(newPassword,10)
    user.password=hashedPassword
    await user.save();
    req.session.destroy()
    res.redirect('/login')
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//user personal information update
exports.userInfoUpdate=async(req,res)=>{
  try {
    const {firstName,lastName,mobileNumber,email,dateOfBirth,gender}=req.body;
    const userId=req.session.userId
    const user=await User.findById(userId)
    const updatedFields={
      firstName,
      lastName,
      mobileNumber,
      email,
      dateOfBirth,
      gender
   };
   Object.assign(user, updatedFields);
   await user.save();
   setTimeout(() => {
    res.render('./user/userprofile',{user})
   }, 2000);
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//add new address to the user saved addresses
exports.addAddress=async(req,res)=>{
  try {
    const { address,town,pincode,district,state,country }=req.body
    const userId=req.session.userId
    const user=await User.findByIdAndUpdate(
      userId,
      {$push:{userAddress:{address:address,town:town,pincode:pincode,district:district,state:state,country:country}}},
      {new:true}
    )
    setTimeout(()=>{
      res.redirect('/address')
    },2000)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//delete user saved address
exports.deleteAddress=async(req,res)=>{
  try {
    const addressId=req.params.addressId
    const userId=req.session.userId
    const user=await User.findByIdAndUpdate(userId,{
      $pull:{userAddress:{_id:addressId}}
    },{new:true});
    res.redirect('/address')
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//edit user address
exports.editAddress=async(req,res)=>{
  try {
    const addressId=req.params.addressId
    const userId=req.session.userId
    const { address,town,pincode,district,state,country}=req.body;
    const user=await User.findOneAndUpdate(
      {_id:userId,'userAddress._id':addressId},
      {
        $set:{
          'userAddress.$.address':address,
          'userAddress.$.town':town,
          'userAddress.$.pincode':pincode,
          'userAddress.$.district':district,
          'userAddress.$.state':state,
          'userAddress.$.country':country,
        },
      },
      {new:true}
    );
    setTimeout(()=>{
      res.redirect('/address')
    },2000)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//update cart item quantity and price
exports.updateQuantity=async(req,res)=>{
  try {
    const { productId, newQuantity } = req.params 
    const userId = req.session.userId
    const user = await User.findById(userId)
    if (!user) {
        return res.status(404).json({error: 'User not found'})
    }
    // Find the cart item with the matching product ID
    const cartItem = user.cart.find((item) => item.productId._id.toString() === productId)
    if (!cartItem) {
        return res.status(404).json({error: 'Product not found in the cart'})
    } 
    const product=await Product.findOne({_id:productId})
    const proSinglePrice=product.price
    cartItem.quantity = parseInt(newQuantity)
    cartItem.totalPrice = proSinglePrice * cartItem.quantity
     // Calculating total sum of the  product in cart
     const totalSum = user.cart.reduce((sum,cartItem)=>{
        return sum + cartItem.totalPrice
    },0)
    req.session.totalSum=totalSum
    await user.save()
    // Respond with the updated total price
    res.json({updatedTotalPrice: cartItem.totalPrice,totalSum})
} catch (error) {
    console.error('Error:',error)
}
}

//to get the product quantity to increase the product quantity in cart
exports.getProductDetails=async(req,res)=>{
  try {
    const productId=req.params.productId
    const product=await Product.findById(productId)
    res.json({availableQuantity:product.quantity})
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

//to set an address as default
exports.setDefaultAddress=async(req,res)=>{
  try {
    const addressId=req.params.addressId;
    const userId=req.session.userId;
    const user=await User.findById(userId)
    user.userAddress.forEach((address) => {
      if (address._id.toString() === addressId) {
          address.isDefault = true;
      } else {
          address.isDefault = false;
      }
    });
    await user.save()
    res.json({ success: true });
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false });
  }
}

//to place an order
exports.orderPlace=async(req,res)=>{
  try {
   const { firstName,lastName,address,town,pincode,district,state,country,mobileNumber,paymentMethod }=req.body
   //totalPrice to store in database
   const totalPrice=req.session.totalSum
   const userId=req.session.userId
   //cartTotal to render the cart page
   const cartTotal=req.session.totalSum
   const user=await User.findById(userId)
   const defaultAddress = user.userAddress.find((address) => address.isDefault === true);
   if(!firstName||!lastName||!address||!town||!pincode||!district||!state||!country||!mobileNumber||!paymentMethod){
    res.render('./user/checkout',{user,defaultAddress,cartTotal,alert:'Please fill all the required fields or select a payment method'})
   }
   if(firstName && lastName && address && town && pincode && district && state && country && mobileNumber){
    const newAddress = {
      firstName,
      lastName,
      address,
      town,
      pincode,
      district,
      state,
      country,
      mobileNumber,
    }; 
    const products = await Promise.all(
      user.cart.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        const productTotalPrice = cartItem.quantity * product.price;
        return {
          productId: cartItem.productId,
          orderQuantity: cartItem.quantity,
          productTotalPrice: productTotalPrice,
        };
      })
    );
    const orderData = new Order({
      userId,
      products, 
      totalPrice, 
      orderStatus: 'Pending', 
    });
    orderData.address.push(newAddress);
    await orderData.save()
    user.cart=[];
    await user.save();
   }
  } catch (error) {
    console.error(error)
  }
}

//for online payment
exports.onlinePayment=async(req,res)=>{
  try {
    const totalPrice=req.body.totalPrice
    const options={
      amount:totalPrice*100,
      currency:'INR',
    }
    const order=await razorpay.orders.create(options)
    res.json({orderId:order.id})
  } catch (error) {
    console.error(error)
    return res.status(500).json({error:'Internal Server Error'})
  }
}