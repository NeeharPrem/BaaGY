const mongoose= require('mongoose');

const orderData = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address',
    },
    date:{
        type:Date,
    },
    orderStatus:{
        type:String,
    },
    returnStatus:{
        type:Boolean,
        default:false,
    },
    products:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'products',
        },
        count:{
            type:Number
        },
        subtotal:{
            type:Number
        },
        orderStatus: {
            type: String,
        },
        returnStatus: {
            type: Boolean,
            default: false,
        }
    }],
    paymentMode:{
        type:String,
        required:true,
    },
    total:{
        type:Number,
        required:true,
    },
    walletAmt: {
        type:Number
    }
});
module.exports=mongoose.model('orders',orderData)