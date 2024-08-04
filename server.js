 require('dotenv').config();
 const { User,Admin,Course }  =  require('./db')
 const AWS = require('aws-sdk');
 const express = require('express');
 const jwt = require('jsonwebtoken'); 
 const bodyParser = require('body-parser');
 const { default: mongoose } = require('mongoose');
 const adminRouter = require('./routes/admin');
 const userRouter = require('./routes/user');

 const {getUrl}  = require('./middleware/s3')

 const {upload} = require('./middleware/fileupload');

 const cors = require('cors');


 const port = 9000;
 const app = express();

 //app.use(express.urlencoded( { extended : false }));
 
 // app.use(bodyParser.urlencoded( { extended: false } ));   // middle
 //app.use(bodyParser.json())

 console.log(process.env.DB_URL);

// app.use(cors({
//    credentials:true,
//    origin:"http://localhost:3000"
// }))

app.use(cors());

app.use(express.static('build'))

//app.use(cors())

app.use(express.urlencoded({extended:true}))
app.use((req,res,next)=>{
   res.header('Content-Type','multipart/form-data;charset=UTF-8');
   res.header('Access-Control-Allow-Credentials',true);
   res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept')
    next()
})

 
app.use('/admin',adminRouter);
app.use('/user',userRouter);


 


//  app.use((req,res,next)=>{
//    res.header('Content-Type','application/json;charset=UTF-8');
//    res.header('Access-Control-Allow-Origin','*')
//    res.header('Access-Control-Allow-Credentials',true);
//    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept')
//     next()
// })
 

 

//  app.get('/',async(req,res)=>{

//        let url =  await getUrl('1713247898166')
//     res.json({message:"Welcome in Course ganesh :",url})

//  })

 // Admin Routes :
 
app.post('/uploads',upload.array('files'),(req,res)=>{
   
   console.log(req.files)
    
 console.log('files upload routes :')
  
 res.json({message:"routes working :"})
 
})
 //user routes   
 
 

 

 app.listen(port,()=>{
    console.log(`Server is Running on Port  ${port} :`)
 })
                      