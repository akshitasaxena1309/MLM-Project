const mongoose = require("mongoose");

const Seller = mongoose.model("Seller", {
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
  aadharNo: {
    type: String,
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
      orderNumber: {
        type: String,
      },

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

  stock: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
    },
  ],

  sales: [
    {
      billNumber: { type: String, unique: true },
      user: { type: String, required: true },
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
});

module.exports = Seller;
