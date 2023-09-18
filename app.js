require('dotenv').config()

const express=require('express')
const path=require('path')
const morgan=require('morgan')
const session=require('express-session')
const {v4:uuidv4}=require('uuid')
const bcrypt=require('bcrypt')
const connectDB=require('./config/db')
//const expressLayouts=require('express-ejs-layouts')

const app=express()

const port=5000 || process.env.PORT
const sessionSecret=uuidv4()

app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}))

app.use(express.json())

connectDB();

//static files
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
  }));
//templating engine
//app.use(expressLayouts)
//app.set('layout','./layouts/main')
app.set('view engine','ejs')

//routes
app.use('/',require('./routes/user'))
app.use('/',require('./routes/admin'))

app.get('/',(req,res)=>{
    res.render('./user/home')
})

app.listen(port,()=>{
    console.log(`Server started on port http://localhost:${port}`)
})