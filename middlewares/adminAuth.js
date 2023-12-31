const Admin=require('../models/admin')
const mongodb=require('mongodb')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

 
exports.noSession=async(req,res,next)=>{
    try{
        if(!req.session.admin){
            return res.redirect('/adminlogin')
        }
        return next()
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}


exports.yesSession=async(req,res,next)=>{
    try{
        if(req.session.admin){
            return res.redirect('/dashboard')
        }
        return next()
    }catch(error){
        console.error(error)
        res.redirect('/error?err=' + encodeURIComponent(error.message));
    }
}