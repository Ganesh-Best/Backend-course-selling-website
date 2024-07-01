const express = require('express');
const {User,Admin,Course} = require('../db');
const {adminAuth,adminSecret,generateJwt} = require('../middleware/auth');
const {upload} = require('../middleware/fileupload');
const {getUrl} = require('../middleware/s3');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/me',adminAuth, async(req,res)=>{
 
   let isUser  =  await Admin.findOne({username:req.user.username})

   res.json({username:isUser.username})

})

router.get('/info',adminAuth, async(req,res)=>{
                  
    const  isFound   =    await Admin.findOne({username :{$eq:req.user.username}})
    console.log("info route")
    console.log(isFound)
    res.json({email:isFound.username,name:isFound.name,courseCount:isFound.createCourse.length,mobile:isFound.mobile})
})

router.post('/signup',async(req,res)=>{
  
    const {username,password,name,mobile}  = req.headers;

    if(username && password && name && mobile){

        let isFound = await Admin.findOne({username:{$eq:username}})

        if(isFound !== null){
         res.status(302).json({message:"Admin Already exist ,Please login :"})
        }else{
             let isUser = await Admin.create({username,role:"admin",mobile:mobile,password,name,createCourse:[]})
             
             res.status(201).json({message:"Admin Sign up successfully , Kindly login :"})             
        }



    }else
    res.status(411).json({message:"provide username and password :"})


})

 router.post('/signin',async(req,res)=>{

    const {username,password} = req.headers;
       console.log('server',username,password)
    if(username && password){
          
             let isFound = await Admin.findOne({username:{$eq:username},password:{$eq:password}})

             if(isFound !== null){
                    
                  console.log('signin',isFound._id)
                  const token = generateJwt({username},'admin');
                  console.log("token",token);
                  console.log("ID",isFound._id)
                  req.user = {
                    username:isFound.username , 
                    id: isFound._id}   
                  res.json({message:"Authentication Successful :",userInfo:{email:isFound.username,name:isFound.name,token,id:isFound._id,role:isFound.role||"admin"}})

             }else
             res.status(404).json({message:"Username or password incorrect:"});

    }else
    res.status(411).json({message:"Invalid  username or password "});
  

 })

 //upload.array('files')
 
 router.post('/course' ,adminAuth ,upload.any() , async(req,res)=>{
          
     //  let  files = [] ;  
       // Check whether Proper data provided from frontEnd 
      
       console.log("request",req.body?.title,req.body?.description,req.body?.price)

       console.log(req.user);
        
      if(!req?.files || !req.body?.title || !req.body?.description || !req.body?.price || !req.body?.image)
       return  res.status(411).json({message:"Please provided Proper Content for Course !"})
            
        //    req.files.forEach((v,i)=>{
        //     let fileInfo = {
        //         key:v.key,
        //         name: v.originalname,
        //         type : v.mimetype,
        //     }
        //     files.push(fileInfo)
        //    })
 
           const newCourse = {
             ...req.body,
             introVideo:{
                key: req.files[0].key,
                name:req.files[0].originalname,
                type:req.files[0].mimetype,
                size:req.files[0].size,
             },
             file1:{
                key: req.files[1].key,
                name:req.files[1].originalname,
                type:req.files[1].mimetype,
                size:req.files[1].size,
             },
             file2:{
               key: req.files[2].key,
               name:req.files[2].originalname,
               type:req.files[2].mimetype,
               size:req.files[2].size,
            },

           } 
           console.log('Course Details :')
           console.log(newCourse);
         let isCourse  =  await Course.create(newCourse)
         
          if(isCourse != null){
               let isFound = await Admin.findOne({username:{$eq:req.user.username}})
                isFound.createCourse.push(isCourse._id);
               await isFound.save();
            return res.status(201).json({message:"Course has  been created Successfully!",isCourse});
          }

             
          
       
       
       
        
    //     console.log("Body data :")    
       
    //     console.log({...req.body})
    //     console.log(req.files)
 




    //   res.json({message:"hi"})
    // const {title,description,price,image,published} = req.body ;
      
    //  if(title && description && price && image && published){
      
    //  let isCreate = await Course.create(req.body) ;
     
    //  if(isCreate !== null ){
           
    //     let isAdmin = await Admin.findOne({username:{$eq:req.user.username}})
             
    //         isAdmin.createCourse.push(isCreate)

    //         await isAdmin.save()

    //         //   Admin.findByIdAndUpdate(isAdmin._id,isAdmin)     
    //        console.log('course created :',isCreate)
           
    //        res.json({message:"Course created :",id:isCreate._id})  
    //  }
        
    //  }else
    //  res.status(411).json({message:"Invalid Course :"})
    

 })

 router.put('/course/:id',adminAuth,upload.any(),async(req,res)=>{
    
     const id = req.params.id;

     console.log('update route req.body',id,req.body,req.files)

     if(mongoose.Types.ObjectId.isValid(id)){

         console.log("update course ",req.body);

          
         if(!req?.files || !req.body?.title || !req.body?.description || !req.body?.price || !req.body?.image)
         return  res.status(411).json({message:"Please provided Proper Content for Course !"})
              
          //    req.files.forEach((v,i)=>{
          //     let fileInfo = {
          //         key:v.key,
          //         name: v.originalname,
          //         type : v.mimetype,
          //     }
          //     files.push(fileInfo)
          //    })
   
             const newCourse = {
               ...req.body,

               file1:{
                  key: req.files[0].key,
                  name:req.files[0].originalname,
                  type:req.files[0].mimetype,
                  size:req.files[0].size,
               },
               file2:{
                  key: req.files[1].key,
                  name:req.files[1].originalname,
                  type:req.files[1].mimetype,
                  size:req.files[1].size,
               }
  
             } 




       
            
            let isupdate = await Course.findByIdAndUpdate(id,newCourse,{new:true})

            console.log('Updated Course',isupdate)

            if(isupdate !== null){
              
                res.status(201).json({message:"Course has been updated Successfully :",course:isupdate})

            }else
            res.status(404).json({message:"Course not found with ID :"})


     }else
      res.status(404).json({message:"No Course found with ID:"})

    
 }) 

 router.get('/course/:id',adminAuth, async(req,res)=>{
  
     const id = req.params.id ;
     
     if(mongoose.Types.ObjectId.isValid(id)){
             
            let isFound = await Course.findOne({_id:id})
            if(isFound !== null)
            res.status(200).json({message:"Course Found :",course:isFound})
            else
            res.status(404).json({message:"No course found :"})

     }else
     res.status(404).json({message:"Course not found with id :"})


 })
 
 router.get('/viewcourse/:id',adminAuth,async(req,res)=>{
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

 })
 // If course found return array of courses , otherwise empty array.

 router.get('/courses',adminAuth,async(req,res)=>{
    
           let iscourses = await Admin.findOne({username:{$eq:req.user.username}}).populate('createCourse');
           
           if(iscourses !== null)
           res.json({message:"Courses",courses:iscourses.createCourse||[]})
           else
           res.status(404).json({message:"No user found :"})
 
        })


        module.exports = router;