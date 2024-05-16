const { S3Client } = require('@aws-sdk/client-s3')

const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path  = require('path');

require('dotenv').config();







const s3 = new S3Client({
    credentials:{
        accessKeyId: 'AKIAXYKJUUI2VXEERSNU',  // from AWS IAM
        secretAccessKey: '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'      
    },
    region:'ap-south-1'
})


const checkFileType = (req,file,cb) =>{
    const fileTypes = /mp4|docx|pdf|jpeg|jpg|png/;
        
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())  
    
    if(extName)
     cb(null,true)
    else
     cb('Error: Only Video , Docx , PDF  and Image files are allowed!',false);
}

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'coursebucket2',
      contentType:multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    }),
    fileFilter:function(req,file,cb){
         checkFileType(req,file,cb)
    }
  })



module.exports = {
     upload 
}  