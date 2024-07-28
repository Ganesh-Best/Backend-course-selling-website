const express = require('express') ;
const {User,Course} = require('../db')
const {userAuth,generateJwt,userSecret} = require('../middleware/auth');
const {getUrl} = require('../middleware/s3');
const { mongoose } = require('mongoose');
const razorpay = require('razorpay');
const {createOrder,paymentSuccess,paymentInfo} = require('../middleware/payment')



const router = express.Router()

router.post('/signup',async(req,res)=>{
   
   try {
    
     const {username ,password ,name, mobile} = req.headers;
 
     if(username && password){
                            
         let  isFound  = await User.findOne({username:{$eq:username}});
 
           if(isFound !== null){
            
             res.status(302).json({message:"User already exists,kindly login"})
 
           }else{
               
           let isCreate = await User.create({role:"user",name,mobile,username,password,purchasedCourse:[]})
            
             console.log('userCreated:',isCreate)        
             res.status(201).json({message:"User Sign up successfully , Kindly login :"})
 
         }
 
     }
 
   } catch (e) {
      res.status(500).json({message:"Ops something went wrong , reach out to admin "})
   }

})

router.post('/signin', async(req,res)=>{

   try {
    const {username,password} = req.headers
 
    if(username &&  password){
               
         let isFound  =  await User.findOne({username:{$eq:username},password:{$eq:password}});
       
         if(isFound !== null){ 
                       
             let   token  = generateJwt({username:username});
 
             res.json({message:"Login Successful: ",userInfo:{email:isFound.username,name:isFound.name,token,id:isFound._id,role:isFound.role||"user"}})
 
 
         }else
         res.status(404).json({message:"Username or Password is incorrect :"})
 
    }else
    res.status(411).json({message:"Username and password is required :"})
    
    
   } catch (e) {
    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
   }

})

// remove ,userAuth as  user can access course without login :
router.get('/course',async(req,res)=>{
  try {
     
      let courses     =  await Course.find({published:true})
        
        if(courses !==null)
        res.json({courses:courses })
        else
        res.json({courses:[]})
  
  } catch (e) {
    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
  }
})

//Give  all features courses :

router.get('/courses/feature',async(req,res)=>{
   
  try {
    let courses     =  await Course.find({published:true,featured:true})
      
      if(courses !==null)
      res.json({courses:courses })
      else
      res.json({courses:[]})
  
  } catch (e) {

    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
    
  }
})

router.get('/coursedetail/:id',async(req,res)=>{
    
   try {
     const  courseId = req.params.id ;         
        console.log(courseId);
       if(mongoose.Types.ObjectId.isValid(courseId)){
      
         let isFound   =  await Course.findOne({_id:{$eq:courseId},published:true})
         
         if(isFound != null) {
          let {title,description,syallabus,introVideo,image,price,_id} = isFound ;
 
            introVideo.url   =   await getUrl(introVideo.key)
             
            console.log({title,description,syallabus,introVideo,image})
            res.json({title,description,syallabus,introVideo,image,price,id:_id})
        
         }else
           res.status(404).json("Course not found with Id :")
       }else
       res.status(411).json({message:"Id is required :"})
 
   } catch (e) {
    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
   }
})
//,userAuth
router.post('/checkout',userAuth,createOrder);

router.post('/paymentverify',paymentSuccess)


router.get('/paymentinfo',userAuth,paymentInfo)

router.get('/myCourses', userAuth, async(req,res)=>{

   try {
     console.log('my Courses route hitting :' ,req.user.username)
     
     
     let isUser  = await User.findOne({username:{$eq:req.user.username}}).populate('purchasedCourse')
      
     console.log(isUser)
     if(isUser !== null){
 
         res.json({"courses":isUser.purchasedCourse ||[]})
                   
 
     }else
     res.status(404).json({message:""})
 
   } catch (e) {
    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
   }
})

router.post('/course/:id',userAuth,async(req,res)=>{

     try {
       const courseId = req.params.id;
 
       if(mongoose.Types.ObjectId.isValid(courseId)){
             
              let isFound = await Course.findById(courseId)
 
              if(isFound !== null){
 
                     let user  = await User.findOne({username:{$eq:req.user.username}}) 
                    
                     if(user !== null){
                     user.purchasedCourse.push(isFound)
                          
                     await user.save() 
                     }else
                      res.status(403).json({message:"User not found :"});
                     
                 res.status(201).json({message:"Course has been purchased successfully :"})
 
              }else
              res.status(404).json({message:"Course does not found :"})
 
 
       }
       else
       res.status(404).json({message:"Invalid Course ID:"})
 
     } catch (e) {

      res.status(500).json({message:"Ops something went wrong , reach out to admin "})
      
     }
})

router.get('/viewcourse/:id',userAuth,async(req,res)=>{
  
  try {
    const id  =    req.params.id;
      console.log("viewcourse route",id) 
     if(mongoose.Types.ObjectId.isValid(id)){
  
            let isFound  =   await Course.findOne({_id:{$eq:id}})
                 
                if(isFound !== null){
                    let url =  await getUrl(isFound.file1.key)
                     isFound.file1.url = url;
                        url     = await getUrl(isFound.file2.key)     
                        isFound.file2.url = url ;
                         
                        console.log("S3 URLs",isFound);
  
                        res.json({message:"Course found :",isFound})
  
                }else
                 res.status(404).json({message:"Course not found with this ID :"})
  
     }else
     res.status(404).send("Invalid Course Id")
  
  } catch (e) {
    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
  }
})

router.get('/video',userAuth,async(req,res)=>{
  
  try {
    
     const {key} = req.headers;
     
   
  
    if(key){
            
    const url  = await getUrl(key)
  
  
    
    return res.status(200).json({key,URL:url,message:"Video found :"})
    
    }
    
    res.status(404).json({key,message:"Ops Video not Found :"})
  
  } catch (e) {

    res.status(500).json({message:"Ops something went wrong , reach out to admin "})
    
  }
})

router.get('/userinfo',userAuth,async(req,res)=>{
   
     try {
      const email = req.user.username;
                     
     const {name,username,password,mobile}  =  await User.findOne({username:email})
                          
     res.status(200).json({userInfo:{name,email:username,password,mobile}})
      
     } catch (error) {
      
      res.status(500).json({message:"Internal Server Error Occur :"})
     }        
      
})

router.post('/passchange',userAuth,async(req,res)=>{

   try {
       const {password} = req.headers;
       const {username} = req.user ;
     console.log("email ,",username ,password)
     console.log("headers ",req.headers ,req.user);
       if(password){
 
         const isFound   =  await  User.findOne({username})
 
             if(isFound){
                  isFound.password = password;
                  isFound.save();
                  console.log('new is Found',isFound)
                  res.status(200).json({message:"Password  has been changed successfully :"})
             }else
             res.status(400).json({message:"unable to change password"})
 
       }
 
   } catch (e) {
    
    res.status(500).json({message:"Ops something went wrong , reach out to admin "})

   }
})


module.exports = router
