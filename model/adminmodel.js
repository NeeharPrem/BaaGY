const mongoose= require('mongoose');

const adminData = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});
module.exports=mongoose.model('admin',adminData)