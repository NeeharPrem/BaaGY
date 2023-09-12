const mongoose = require("mongoose");

const bannerData = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
});

module.exports = mongoose.model("banner", bannerData);