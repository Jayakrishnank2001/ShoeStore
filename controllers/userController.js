const User=require('../models/users')
const Product=require('../models/product')
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const crypto=require('crypto')
const randomstring=require('randomstring')
const { log } = require('console')
const { product } = require('./adminProductController')

exports.loginPage=async(req,res)=>{
    res.render('./login/userLogin')
}

//route for products page
exports.productspage=async(req,res)=>{
    try{
         const page=parseInt(req.query.page)||1;
         const limit=6;
         const skip=(page-1)*limit;

         const products=await Product.find()
          .skip(skip)
          .limit(limit)
          .exec();

          const totalCount=await Product.countDocuments();
          const totalPages=Math.ceil(totalCount/limit);
           
         res.render('./user/shop',{products,currentPage:page,totalPages});
    }catch(error){
      console.error(error);
      res.status(500).send('Internal server error.');
    }
}

exports.productpage=async(req,res)=>{
  res.render('./user/product')
}

exports.otppage=async(req,res)=>{
  res.render('./login/userloginotp')
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
        req.session.user=user;
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
