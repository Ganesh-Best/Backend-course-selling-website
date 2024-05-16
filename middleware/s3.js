const AWS = require('aws-sdk');

require('dotenv').config()

AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
  })

const S3 = new AWS.S3();

const getUrl = async(key)=>{
 
    let URL  = await S3.getSignedUrl('getObject',{
            "Bucket": process.env.bucketName,
            "Key": key,
            "Expires": 3600
         })
       
         return URL
        
}
 



module.exports = {
    getUrl
}
