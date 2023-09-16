const mongoose= require('mongoose');

const categoryData = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "offer",
  },
  img: {
    type: Array,
    maxItems: 2,
  }
});
module.exports=mongoose.model('category',categoryData)