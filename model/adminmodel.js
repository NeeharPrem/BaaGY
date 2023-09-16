const mongoose= require('mongoose');

const adminData = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    isadmin: {
        type: Boolean,
        default: true,
    },
    password:{
        type:String,
        required:true
    }
});
module.exports=mongoose.model('admin',adminData)