const mongoose = require("mongoose");

const User = mongoose.model("User", {
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  referId: {
    type: String,
    required: true,
  },
  referrer: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, default: 1 },
    },
  ],

  orders: [
    {
      orderNumber: { type: String, unique: true },
      products: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, required: true },
          _id: false,
        },
      ],
      totalAmount: { type: Number, required: true },
      orderDate: { type: Date, default: Date.now },
    },
  ],
  buynow: {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: { type: Number, default: 1 },
  },
  bv: {
    type: Number,
    default: 0,
  },
  totalBv: {
    type: Number,
    default: 0,
  },
  performanceEarnings: {
    type: Number,
    default: 0,
  },
  royaltyEarnings: {
    type: Number,
    default: 0,
  },
  globalEarnings: {
    type: Number,
    default: 0,
  },
  childBv: {
    type: Number,
    default: 0,
  },
});

module.exports = User;
