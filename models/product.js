const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  title: {
    type: String,
    required: true,
    //unique lgana h
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  imgs: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    default: "Agri-Cultural Product",
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  bv: {
    type: Number,
    required: true,
  },
  dp: {
    type: Number,
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  lastUpdateDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Product;
