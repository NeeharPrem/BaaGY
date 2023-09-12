const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  wallet: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  referral: {
    type: String,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  wishlist: {
    type: Array,
  },
  walletHistory: [
    {
      date: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      type: {
        type: String,
      },
      balance: {
        type: Number,
      },
      details: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("User", userDataSchema);
