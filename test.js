const express= require('express');
const AWS = require('aws-sdk');
//const AWS = require('@aws-sdk')
require('dotenv').config()
const app = express();

const port = 7000;

AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
  })

  // Create an S3 instance
const S3 = new AWS.S3();

const getUrl = (key)=>{
    
 let URL ;

              

 return URL;
}


app.get('/data',async(req,res)=>{
 
    let url =  await S3.getSignedUrl('getObject',{
            "Bucket": process.env.bucketName,
            "Key": '1713247898166',
            "Expires": 3600
          })
  console.log(url);

    res.json({message:"Data is getting ;",url})

})

app.listen(port,(req,res)=>{
    console.log('Server is running',port)
})