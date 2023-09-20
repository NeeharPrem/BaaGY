const mongoose= require('mongoose');

const cartData = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    product:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'products',
        },
        count:{
            type:Number
        },
        subtotal:{
            type:Number
        }
    }],
    total:{
        type:Number
    },
    appliedcoupon:{
        type:String
    },
    subtotal:{
        type:Number
    },
    discount:{
        type:Number
    }
})
module.exports=mongoose.model('cart',cartData)