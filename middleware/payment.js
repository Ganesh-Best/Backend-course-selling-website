const razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

const {User,Payment, Course} = require('../db')

const createOrder = async(req,res)=>{
    

    const {amount} = req.headers;

    const instance  = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })

    const options = {
        amount:(amount*100),
        currency:'INR'
    }
    try {
              
         const orderDetails = await instance.orders.create(options);
    
    
        res.json({success:true,key_secret:process.env.RAZORPAY_KEY_ID,order:orderDetails})
    
    } catch (error) {
        console.log('ops something went wrong :');
    }
}

//check whether payment is authentic or not: 
//if Payment authentic then save information to Database

const paymentSuccess = async(req,res)=>{

    const email = req.query.email;
     const  id   = req.query.id;

     console.log('Id received from callback url',id);  

    const { razorpay_payment_id,razorpay_order_id,razorpay_signature } = req.body ;
    
    const body = razorpay_order_id + '|' + razorpay_payment_id

     const expectedSignature   =   crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
             .update(body.toString()).digest('hex');     

     const signMatch = expectedSignature === razorpay_signature ;

     if(signMatch){
         const {title,description,price} = await Course.findOne({_id:id});
         const {username,name,mobile} =  await User.findOne({'username':{$eq:email}})
                                   
        const isCreated   =  await Payment.create({
                name,
                mobile,
                email:username,
                title,
                description,
                price,
                payment_id:razorpay_payment_id,
                order_id:razorpay_order_id,
                signature:razorpay_signature,
                courseId:id
               })

               if(isCreated != null){
                   
                    console.log('User Found :',username,name,mobile,title,description,price);
                    console.log({success:true,razorpay_order_id,razorpay_payment_id,razorpay_signature})
                    

                    if(mongoose.Types.ObjectId.isValid(id)){
            
                        let isFound = await Course.findById(id)
           
                        if(isFound !== null){
           
                               let user  = await User.findOne({username:{$eq:email}}) 
                              
                               if(user !== null){
                               user.purchasedCourse.push(isFound)
                                    
                               await user.save() 
                               }else
                                res.status(403).json({message:"User not found :"});
                             
                                res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
                        //    res.status(201).json({message:"Course has been purchased successfully :"})
           
                        }else
                        res.status(404).json({message:"Course does not found :"})
           
           
                 }


                    

                    // res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
               
          }else{
             console.log('redirect to payment failure page :') 
          }
              
    }else
       console.log({success:false})
}


// This will receive either reference or courseId  as variable in URL 

const paymentInfo = async(req,res)=>{
    
    let id = '';
    let isFound = null;

    let transaction_id = '' ;

    console.log('req.query.reference' ,req.query.courseId)

    //if receive course Id as variable 
    if(req.query.courseId){
        id = req.query.courseId;
        
        // let searchValue= course_id;
        // let search_key = 'courseId';
        //     // course_id   =  new mongoose.Types.ObjectId(course_id);
       //  searchCriteria = { [search_key]: searchValue  }
        

     }else{
        // if receive transation_id as variable
          transaction_id = req.query.reference;
        //searchCriteria = { 'payment_id': transaction_id }
         
     }

     //console.log('req.query',req.query.reference,searchCriteria);

    

    // const {name,email,mobile,createdAt,payment_id,order_id,title,description,price}  =   await Payment.findOne({searchCriteria});
   
    console.log('req.query.course_id',req.query.courseId,id);

    let isFound2   =   await Payment.findOne({courseId:id})
     
    console.log('isFound2',isFound2,{courseId:id});

    (req.query.courseId)?(isFound = await Payment.findOne({courseId:id})):(isFound = await Payment.findOne({payment_id:transaction_id}))
    
     const {name,email,mobile,createdAt,payment_id,order_id,description,price,courseId,title} = isFound;
    
       if(payment_id){
      
        console.log('Payment details send to client') 
        res.json({name,email,mobile,createdAt,payment_id,order_id,title,description,price,courseId}) 
    
       }

}
module.exports = {
    createOrder,paymentSuccess ,paymentInfo
}