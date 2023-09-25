const User=require('../models/users')
const mongodb=require('mongodb')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')


exports.noSession=async(req,res,next)=>{
    try{
        if(!req.session.user){
           return res.redirect('/login')
        }
        return next()
    }catch(error){
        console.error(error)
        res.status(500).send('Internal Server Error');
    }
}


exports.yesSession=async(req,res,next)=>{
    try{
        if(req.session.user){
            return res.redirect('/home')
        }
        return next()
    }catch(error){
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}


exports.userBlockedByAdmin=async(req,res,next)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
                console.error('Error destroying session:',err);
                return res.render('error')
            }
            res.redirect('/login')
        });
    }catch(error){
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
}