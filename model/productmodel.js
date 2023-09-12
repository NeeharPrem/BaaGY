const mongoose= require('mongoose');

const prdtData = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // Update the field type to ObjectId
    ref: "category", // Specify the referenced model name
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  actual: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  img: {
    type: Array,
    maxItems: 4,
  },
  status: {
    type: Boolean,
    default: false,
  },
  material: {
    type: String,
    required: true,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "offer",
  },
  offerPrice: { type: Number },
  offerAppliedBy: { type: String },
});
module.exports=mongoose.model('products',prdtData)