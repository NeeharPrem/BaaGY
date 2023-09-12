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
  }
});
module.exports=mongoose.model('category',categoryData)