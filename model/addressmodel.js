const mongoose= require('mongoose');

const addressData = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    address:[{
        name:{
            type:String
        },
        mobile:{
            type:String
        },
        address:{
            type:String
        },
        locality:{
            type:String
        },
        pincode:{
            type: Number
        },
        district:{
            type:String
        },
        state:{
            type:String
        }
    }]
})
module.exports=mongoose.model('address',addressData)
