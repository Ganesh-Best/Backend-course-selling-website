const razorpay = require('razorpay');
const crypto = require('crypto');

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
                signature:razorpay_signature
               })

               if(isCreated != null){
                   
                    console.log('User Found :',username,name,mobile,title,description,price);
                    console.log({success:true,razorpay_order_id,razorpay_payment_id,razorpay_signature}) 
                    res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
               
          }else{
             console.log('redirect to payment failure page :') 
          }
              
    }else
       console.log({success:false})
}

const paymentInfo = async(req,res)=>{
 
    const  tranction_id = req.query.reference;

    const {name,email,mobile,createdAt,payment_id,order_id,title,description,price}  =   await Payment.findOne({payment_id:tranction_id});
 
       if(payment_id){
      
        console.log('Payment details send to client') 
        res.json({name,email,mobile,createdAt,payment_id,order_id,title,description,price}) 
    
       }

}
module.exports = {
    createOrder,paymentSuccess ,paymentInfo
}