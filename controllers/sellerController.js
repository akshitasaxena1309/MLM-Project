const Product = require("../models/product");
const Category = require("../models/category");
const Seller = require("../models/seller");
const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
exports.getIndex = async (req, res) => {
  try {
    const category = await Category.find();
    const products = await Product.find().limit(8);
    res.render("seller/home", { category, products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.loginPage = async (req, res) => {
  res.render("seller/loginpage");
};

exports.comapnyDetails = async (req, res) => {
  res.render("seller/company");
};

exports.allProduct = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();
    res.render("seller/all-product", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.singleProduct = async (req, res) => {
  const pId = req.query.pId;
  try {
    const product = await Product.findOne({ _id: pId });
    const category = await Category.findById(product.category);
    // const category=await Category.findById(product.category)
    res.render("seller/single-product", { product, category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.addToCart = async (req, res) => {
  try {
    const productId = req.body.productId;

    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const seller = await Seller.findById(userId);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingCartItem = seller.cart.find((item) =>
      item.product.equals(productId)
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      seller.cart.push({ product: productId, quantity: 1 });
    }
    await seller.save();

    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "please fill the all deatils",
      });
    }
    let seller = await Seller.findOne({ email });
    if (!seller) {
      return res.render("error404");
    }
    const payload = {
      email: seller.email,
      id: seller._id,
    };
    // verify password and generate Jwt token
    if (await bcrypt.compare(password, seller.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (Date.now() >= decodedToken.exp * 1000) {
        // Token is expired, redirect to login page
        return res.redirect("/seller/loginPage");
      }
      seller = seller.toObject();
      // console.log(admin);
      seller.token = token;
      // console.log(admin);
      seller.password = undefined;
      // console.log(admin);
      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("sellerToken", token, options);
      // return res.json({ token });
      return res.redirect("/seller");
    } else {
      return res.render("error404");
    }
  } catch (error) {
    console.log(error);
    return res.render("error404");
  }
};

exports.navprofile = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    // console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const seller = await Seller.findById(userId);
    let cartCount = seller.cart.length === 0 ? 0 : seller.cart.length;
    // console.log(cartCount);

    if (token) {
      // res.render("user/header", { cartCount });
      // console.log(token);
      res.status(200).json({ message: "token is found", cartCount });
      // res.status(200).json({ cartCount });
    } else {
      res.status(404).json({ message: "token not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userprofile = async (req, res) => {
  // res.render("seller/userProfile");
  try {
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const products = await Product.find();
    const userData = await Seller.findOne({ _id: userId });

    res.render("seller/userProfile", { userData, products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie("sellerToken");
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "logout failure",
    });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Extract values from request body
    const { username, email, phone, street, city, state, zipCode, country } =
      req.body;

    // Update user data
    const userData = await Seller.findOneAndUpdate(
      { _id: userId },
      {
        username,
        email,
        phone,
        address: { street, city, state, zipCode, country },
      },
      { new: true }
    );

    res.render("seller/userProfile", { userData });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.buyNow = async (req, res) => {
  try {
    const pId = req.query.pId;
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;
    const seller = await Seller.findOne({ _id: sellerId });
    const product = await Product.findOne({ _id: pId });
    seller.buynow = {
      product: pId,
      quantity: seller.buynow.quantity,
    };
    await seller.save();
    const category = await Category.findById(product.category);
    return res.render("seller/buyNow", { product, seller, category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.cart = async (req, res) => {
  // res.render("seller/cart");
  const token = req.cookies.sellerToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  const user = await Seller.findById(userId);

  const products = await Seller.findById(userId).select("cart.product");
  const cartWithProducts = [];
  for (const cartItem of products.cart) {
    const product = await Product.findById(cartItem.product);
    cartWithProducts.push(product);
  }
  const categoryArray = [];
  for (const p of cartWithProducts) {
    const category = await Category.findById(p.category);
    categoryArray.push(category.name);
  }
  res.render("seller/cart", { user, cartWithProducts, categoryArray });
};

exports.removeFromCart = async (req, res) => {
  const token = req.cookies.sellerToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const productId = req.params.productId;
  const user = await Seller.findById(decoded.id);
  user.cart = user.cart.filter((item) => item.product.toString() !== productId);
  await user.save();
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const productId = req.body.productId;
    const user = await Seller.findById(userId);
    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }
    const operation = req.body.operation;
    if (operation === "increment") {
      cartItem.quantity += 1;
    } else if (operation === "decrement") {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      }
    }
    await user.save();
    res.status(200).json({
      message: "Quantity updated successfully",
      newQuantity: cartItem.quantity,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.submitAddress = async (req, res) => {
  const address = req.body.address;
  const token = req.cookies.sellerToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await Seller.findByIdAndUpdate(
    userId,
    { address: address },
    { new: true }
  );
  res.redirect("/seller/cart");
};

exports.orderDetails = async (req, res) => {
  const token = req.cookies.sellerToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const seller = await Seller.findById(userId);
  const orders = await Promise.all(
    seller.orders.map(async (order) => {
      // Map over products array in each order and find product details
      const productsWithDetails = await Promise.all(
        order.products.map(async (product) => {
          const productDetails = await Product.findById(product.product);
          return {
            name: productDetails.title, // Assuming the product schema has a 'name' field
            quantity: product.quantity,
          };
        })
      );
      return {
        products: productsWithDetails,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
      };
    })
  );

  res.render("seller/orderDetails", { seller, orders });
};

exports.buynowUpdateCartQuantity = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const operation = req.body.operation;

    // Find the user and update buynow quantity based on the operation
    let user = await Seller.findById(userId);
    let buynowQuantity = user.buynow.quantity;

    if (operation === "increment") {
      buynowQuantity += 1;
    } else if (operation === "decrement" && buynowQuantity > 1) {
      buynowQuantity -= 1;
    }

    user.buynow.quantity = buynowQuantity;
    await user.save();

    res.status(200).json({
      message: "Buynow quantity updated successfully",
      newQuantity: buynowQuantity,
    });
  } catch (error) {
    console.error("Error updating buynow quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.addBill = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;

    const { billNumber, user, totalAmount, date, products } = req.body;

    // Find the seller by ID
    const seller = await Seller.findById(sellerId);
    const userschema = await User.findOne({ referId: user });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    if (!userschema) {
      return res.status(404).json({ message: "User not found" });
    }
    const newSalesProducts = products.map((product) => ({
      product: new mongoose.Types.ObjectId(product.productId),
      quantity: product.quantity,
    }));
    seller.sales.push({
      billNumber,
      user,
      totalAmount,
      products: newSalesProducts,
      orderDate: date,
    });
    await seller.save();

    userschema.orders.push({
      orderNumber: billNumber,
      totalAmount,
      products: newSalesProducts,
      orderDate: date,
    });
    await userschema.save();

    res.status(201).json({ message: "Bill added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
