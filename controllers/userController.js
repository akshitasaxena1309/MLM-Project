const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");
require("dotenv").config();

exports.getIndex = async (req, res) => {
  try {
    const category = await Category.find();
    const products = await Product.find().limit(8).sort({ _id: -1 });
    res.render("user/home", { category, products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.allProduct = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find().sort({ _id: -1 });
    res.render("user/all-product", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.singleProduct = async (req, res) => {
  const pId = req.query.pId;
  try {
    const products = await Product.find();
    const product = await Product.findOne({ _id: pId });
    const category = await Category.findById(product.category);
    // const category=await Category.findById(product.category)
    res.render("user/single-product", { product, category, products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.comapnyDetails = async (req, res) => {
  res.render("user/company");
};

exports.signupPage = async (req, res) => {
  res.render("user/signuppage");
};

exports.loginPage = async (req, res) => {
  res.render("user/loginpage");
};

exports.sign = async (req, res) => {
  try {
    const { username, email, password, referrer, phone, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin already Exist",
      });
    }

    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "error in hashing password",
      });
    }
    const uid = new ShortUniqueId({ length: 10 });
    const referId = uid.rnd();
    const Isreferrer = await User.findOne({ referId: referrer });
    if (!Isreferrer) {
      return res.status(400).json({
        success: false,
        message: "Invalid Referral Code",
      });
    }
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      referrer,
      phone,
      address,
      referId,
    });

    // alert('Admin registered successfully');
    res.redirect("/user/loginPage");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registered",
    });
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
    let user = await User.findOne({ email });
    if (!user) {
      return res.render("error404");
    }
    const payload = {
      email: user.email,
      id: user._id,
      role: user.role,
      username: user.username,
    };
    if (await bcrypt.compare(password, user.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (Date.now() >= decodedToken.exp * 1000) {
        // Token is expired, redirect to login page
        return res.redirect("/user/login");
      }
      user = user.toObject();
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options);
      return res.redirect("/user");
    } else {
      return res.render("error404");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "login failure",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const existingCartItem = user.cart.find((item) =>
      item.product.equals(productId)
    );
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }
    await user.save();
    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.removeFromCart = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const productId = req.params.productId;
  const user = await User.findById(decoded.id);
  user.cart = user.cart.filter((item) => item.product.toString() !== productId);
  await user.save();
};

exports.buyNow = async (req, res) => {
  try {
    const pId = req.query.pId;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findOne({ _id: userId });

    const product = await Product.findOne({ _id: pId });
    user.buynow = {
      product: pId,
      quantity: user.buynow.quantity, // You can set the quantity as needed
    };
    await user.save();
    const category = await Category.findById(product.category);

    return res.render("user/buyNow", { product, user, category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.cart = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await User.findById(userId);
  const products = await User.findById(userId).select("cart.product");
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
  res.render("user/cart", { user, cartWithProducts, categoryArray });
};

exports.navprofile = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    let cartCount = user.cart.length === 0 ? 0 : user.cart.length;
    // console.log(cartCount);
    if (token) {
      // res.render("user/header", { cartCount });
      res.status(200).json({ message: "token is found", cartCount });
      // res.status(200).json({ cartCount });
    } else {
      res.status(404).json({ message: "token not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userData = await User.findOne({ _id: userId });
    res.render("user/userProfile", { userData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Extract values from request body
    const { username, email, phone, street, city, state, zipCode, country } =
      req.body;

    // Update user data
    const userData = await User.findOneAndUpdate(
      { _id: userId },
      {
        username,
        email,
        phone,
        address: { street, city, state, zipCode, country },
      },
      { new: true }
    );

    res.render("user/userProfile", { userData });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.orderDetails = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await User.findById(userId);
  const orders = await Promise.all(
    user.orders.map(async (order) => {
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
  res.render("user/orderDetails", { user, orders });
};

exports.logout = (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie("token");
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

exports.updateCartQuantity = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const productId = req.body.productId;
    const user = await User.findById(userId);
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
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await User.findByIdAndUpdate(
    userId,
    { address: address },
    { new: true }
  );
  res.redirect("/user/cart");
};

exports.buynowUpdateCartQuantity = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const operation = req.body.operation;

    // Find the user and update buynow quantity based on the operation
    let user = await User.findById(userId);
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

exports.userTree = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.findById(userId);
    const usersWithSameReferId = await User.find({ referrer: user.referId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.render("user/userTree", { usersWithSameReferId, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.singleCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const category = await Category.findById(categoryId);
    const products = await Product.find({ category: categoryId });

    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }
    res.render("user/single-category", { category, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
