const mongoose = require('mongoose');

const couponData = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    description: {
        type:String
    },
    expiry_date: {
        type: Date,
        required:true
    },
    discount: {
        type: Number,
        required:true
    },
    min_amt: {
        type:Number
    },
    maxdiscount: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default:true
    },
    users: {
        type:Array
    }
})

module.exports = mongoose.model('coupon',couponData)