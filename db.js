const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    "name" :{type:String,required:true},
   "username":{type:String,required:true},
   "password":{type:String,required:true},
   "mobile":{type:Number,required:true},
   "purchasedCourse":[{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true}]  
})
const adminSchema = new mongoose.Schema({
    "name" :{type:String,required:true},
    "username":{type:String,required:true},
    "password":{type:String,required:true},
    "mobile":{type:Number,required:true},
    "createCourse":[{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true}],
})

const courseSchema = new mongoose.Schema({
    "title": { type : String , required : true },
    "description": { type : String , required : true },
    "price": { type : Number , required : true },
    "image": { type : String , required : true },
    "syallabus": { type : String , required : true },
    "introVideo": {type:Object ,required:true },
    "file1": {type:Object ,required:true },
    "file2": {type:Object ,required:true },
    "published":{ type: Boolean ,required:true}
})

const User = new mongoose.model('User',userSchema);
const Admin = new mongoose.model('Admin',adminSchema);
const Course = new mongoose.model('Course',courseSchema);


mongoose.connect('mongodb://0.0.0.0:27017/website')

 
// User.create({"username":"hackgan2@gmail.com","password":"gaesn123"}).then(response=>console.log(response))


module.exports = {User,Admin,Course}