const express = require('express') ;
const {User,Course} = require('../db')
const {userAuth,generateJwt,userSecret} = require('../middleware/auth');


const router = express.Router()

router.post('/signup',async(req,res)=>{
 
    const {username ,password} = req.headers;

    if(username && password){
                           
        let  isFound  = await User.findOne({username:{$eq:username}});

          if(isFound !== null){
           
            res.status(302).json({message:"User already exists,kindly login"})

          }else{
              
          let isCreate = await User.create({role:"user",username,password,purchasedCourse:[]})
           
            console.log('userCreated:',isCreate)        
            res.status(201).json({message:"User Sign up successfully , Kindly login :"})

        }

    }


})

router.post('/signin', async(req,res)=>{

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
    

})

router.get('/course',userAuth,async(req,res)=>{
   
    let courses     =  await Course.find({published:true})
      
      if(courses !==null)
      res.json({courses:courses })
      else
      res.json({courses:[]})

})


router.get('/myCourses', userAuth, async(req,res)=>{
 
    let isUser  = await User.findOne({username:{$eq:req.user.username}}).populate('purchasedCourse')

    if(isUser !== null){

        res.json({"courses":isUser.purchasedCourse ||[]})
                  

    }else
    res.status(404).json({message:""})

})

router.post('/course/:id',userAuth,async(req,res)=>{

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


      }else
      res.status(404).json({message:"Invalid Course ID:"})

})


module.exports = router
