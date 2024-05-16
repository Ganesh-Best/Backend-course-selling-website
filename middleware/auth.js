const jwt = require('jsonwebtoken');

const  adminSecret = process.env.adminSecret ;
const  userSecret =  process.env.userSecret

const adminAuth = (req,res,next)=>{

    const {token} = req.headers ;
     
       if(token){
          
          let cipher =  token.split(' ')[1]

          jwt.verify(cipher,adminSecret,(error,payload)=>{
            if(error)
            return res.sendStatus(403);

            req.user = {username:payload.username};
             next();
          })

       }else
       res.status(411).json({message:"Unauthorized :"})      
}

const userAuth = (req,res,next)=>{

    const {token} = req.headers ;
     
       if(token){
          
          let cipher =  token.split(' ')[1]

          jwt.verify(cipher,adminSecret,(error,payload)=>{
            if(error)
            return res.sendStatus(403);

            req.user = {username:payload.username};
             next();
          })
          
       }else
       res.status(411).json({message:"Unauthorized :"})      

}

const generateJwt = (payload,type)=>{
   let token = "user" 

   if(type === "admin")
      token = jwt.sign(payload,adminSecret,{expiresIn:'3h'})
   else
      token = jwt.sign(payload,userSecret,{expiresIn:'3h'})

  return 'Bearer ' + token ; 

}


module.exports = {
    adminSecret,userSecret,adminAuth,userAuth,generateJwt
}