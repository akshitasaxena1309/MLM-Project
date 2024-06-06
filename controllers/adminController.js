const Product = require("../models/product");
const User = require("../models/user");
const Seller = require("../models/seller");
const Category = require("../models/category");
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");

exports.getLogin = (req, res) => {
  res.render("admin/login");
};

exports.getIndex = async (req, res) => {
  try {
    // Aggregate pipeline to calculate the sum of orders for every user
    const userOrderTotals = await User.aggregate([
      {
        $project: {
          username: 1,
          totalOrders: { $size: "$orders" }, // Count the number of orders for each user
        },
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 }, // Count the total number of users
          totalOrders: { $sum: "$totalOrders" }, // Sum the number of orders across all users
        },
      },
    ]);

    // Aggregate pipeline to calculate the sum of orders for every seller
    const sellerOrderTotals = await Seller.aggregate([
      {
        $project: {
          username: 1,
          totalOrders: { $size: "$orders" }, // Count the number of orders for each seller
        },
      },
      {
        $group: {
          _id: null,
          totalSellers: { $sum: 1 }, // Count the total number of sellers
          totalOrders: { $sum: "$totalOrders" }, // Sum the number of orders across all sellers
        },
      },
    ]);

    const userOrderTotalAmount = await User.aggregate([
      {
        $unwind: "$orders", // Unwind the orders array
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$orders.totalAmount" }, // Sum the totalAmount for each user
        },
      },
    ]);
    const sellerOrderTotalAmount = await Seller.aggregate([
      {
        $unwind: "$orders", // Unwind the orders array
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$orders.totalAmount" }, // Sum the totalAmount for each user
        },
      },
    ]);

    // Extracting the result from the aggregation pipelines
    const totalProduct = await Product.countDocuments();
    const totalUser =
      userOrderTotals.length > 0 ? userOrderTotals[0].totalUsers : 0;
    const totalUserOrders =
      userOrderTotals.length > 0 ? userOrderTotals[0].totalOrders : 0;
    const totalSeller =
      sellerOrderTotals.length > 0 ? sellerOrderTotals[0].totalSellers : 0;
    const totalSellerOrders =
      sellerOrderTotals.length > 0 ? sellerOrderTotals[0].totalOrders : 0;
    const totalUserTotalAmount =
      userOrderTotalAmount.length > 0 ? userOrderTotalAmount[0].totalAmount : 0;
    const totalSellerTotalAmount =
      sellerOrderTotalAmount.length > 0
        ? sellerOrderTotalAmount[0].totalAmount
        : 0;

    res.render("admin/index", {
      totalProduct,
      totalUser,
      totalSeller,
      totalUserOrders,
      totalSellerOrders,
      totalUserTotalAmount,
      totalSellerTotalAmount, // Add totalSellerOrders to pass to the view
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.newUser = async (req, res) => {
  res.render("admin/newUser");
};

exports.newSeller = (req, res) => {
  res.render("admin/newSeller");
};

exports.userSignup = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Exist",
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
    console.log(referId);
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      phone,
      address,
      referId,
      referrer: "root",
    });

    // alert('Admin registered successfully');
    res.redirect("/admin/customers");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registered",
    });
  }
};

exports.sellerSignup = async (req, res) => {
  try {
    const { username, email, password, phone, aadharNo, address } = req.body;
    const existingUser = await Seller.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Seller already Exist",
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
    const seller = await Seller.create({
      username,
      email,
      password: hashPassword,
      phone,
      aadharNo,
      address,
    });

    res.redirect("/admin/sellers");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Seller can not be registered",
    });
  }
};

exports.getSellers = async (req, res) => {
  // res.render("admin/customers");
  try {
    // Assuming you want to fetch all leads from the Lead model
    let seller = await Seller.find();
    res.render("admin/sellers", { seller });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getCategories = async (req, res) => {
  try {
    // Fetch all products from the database
    const category = await Category.find();
    // console.log(category);
    res.render("admin/categories", { category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getProducts = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find().sort({ _id: -1 });
    res.render("admin/products", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
  // res.render("admin/products");
};

exports.Registration = (req, res) => {
  res.render("admin/signup");
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await Admin.findOne({ email });
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

    const admin = await Admin.create({
      name,
      email,
      password: hashPassword,
      role,
    });
    // alert('Admin registered successfully');
    res.redirect("/admin/Registration");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Admin can not be registered",
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
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.render("error404");
    }
    const payload = {
      email: admin.email,
      id: admin._id,
      role: admin.role,
    };
    // verify password and generate Jwt token
    if (await bcrypt.compare(password, admin.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (Date.now() >= decodedToken.exp * 1000) {
        // Token is expired, redirect to login page
        return res.redirect("/admin");
      }
      admin = admin.toObject();
      // console.log(admin);
      admin.token = token;
      // console.log(admin);
      admin.password = undefined;
      // console.log(admin);
      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("admintoken", token, options);
      // return res.json({ token });
      return res.redirect("/admin/index");
    } else {
      return res.status(403).json({
        success: false,
        message: "password incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.render("error404");
  }
};

exports.getOrders = async (req, res) => {
  const user = await User.find();
  const usersWithOrders = await Promise.all(
    user.map(async (user) => {
      const orders = await Promise.all(
        user.orders.map(async (order) => {
          const productsWithDetails = await Promise.all(
            order.products.map(async (product) => {
              const productDetails = await Product.findById(product.product);
              return {
                name: productDetails.title, // Assuming the product schema has a 'title' field
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

      return { user, orders };
    })
  );
  const seller = await Seller.find();
  const sellersWithOrders = await Promise.all(
    seller.map(async (seller) => {
      const orders = await Promise.all(
        seller.orders.map(async (order) => {
          const productsWithDetails = await Promise.all(
            order.products.map(async (product) => {
              const productDetails = await Product.findById(product.product);
              return {
                name: productDetails.title, // Assuming the product schema has a 'title' field
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

      return { seller, orders };
    })
  );
  res.render("admin/orders", { usersWithOrders, sellersWithOrders });
};

exports.getCustomers = async (req, res) => {
  // res.render("admin/customers");
  try {
    // Assuming you want to fetch all leads from the Lead model
    let user = await User.find();
    res.render("admin/customers", { user });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getAddProduct = async (req, res) => {
  const categories = await Category.find();
  res.render("admin/add-product", { categories });
};

exports.getAddCategories = async (req, res) => {
  res.render("admin/add-categories");
};

exports.addProduct = async (req, res) => {
  console.log("Add Product");
  const imgArray = req.body.img.split(",");

  // Extract the first URL as img and the rest as imgs
  const img = imgArray.length > 0 ? imgArray[0] : "";
  const imgs = imgArray;

  const productData = {
    title: req.body.title,
    description: req.body.description,
    img: img,
    imgs: imgs,
    stockQuantity: parseInt(req.body.stockQuantity),
    category: req.body.category,
    mrp: parseFloat(req.body.mrp),
    bv: parseFloat(req.body.bv),
    dp: parseFloat(req.body.dp),
  };

  try {
    // Create a new product instance using the Product model
    const newProduct = new Product(productData);

    // Save the product to the database
    await newProduct.save();

    // Send a response (for example, you can redirect to a success page)
    res.redirect("/admin/products"); // Change the URL as needed
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.viewProduct = async (req, res) => {
  try {
    const leadId = req.params.leadId;
    const product = await Product.findById(leadId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const c = await Category.findOne({ _id: product.category });
    const productWithCategoryInfo = {
      ...product.toObject(),
      category: c.name,
    };
    res.json(productWithCategoryInfo);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.addCategories = async (req, res) => {
  console.log("Add Category");
  const CategoryData = {
    name: req.body.title,
    img: req.body.img,
  };

  try {
    // Create a new product instance using the Product model
    const newCategory = new Category(CategoryData);

    // Save the product to the database
    await newCategory.save();

    // Send a response (for example, you can redirect to a success page)
    res.redirect("/admin/categories"); // Change the URL as needed
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
    });

    if (deletedProduct) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const deletedCategory = await Category.findOneAndDelete({
      _id: categoryId,
    });

    if (deletedCategory) {
      res.status(200).json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ message: "Categorynot found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editCategory = async (req, res) => {
  const { categoryId, categoryName, categoryImage } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name: categoryName, img: categoryImage },
      { new: true }
    );

    if (!category) {
      return res.status(404).send("category not found");
    }
    res.redirect("/admin/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getEditProduct = async (req, res) => {
  const categories = await Category.find();
  const pId = req.params.pId;

  const product = await Product.findById(pId);

  res.render("admin/edit-product", { categories, product });
};

exports.editProduct = async (req, res) => {
  const { pId, title, description, img, category, stockQuantity, mrp, bv, dp } =
    req.body;

  try {
    // Check if pId is provided
    if (!pId) {
      return res.status(400).send("Product ID is required");
    }

    // Check if the product with the given ID exists
    const existingProduct = await Product.findById(pId);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    // Split the comma-separated imgs string into an array of URLs
    const imgArray = img ? img.split(",") : [];

    // Use the first URL from the imgArray as the value for the img field
    const firstImgUrl = imgArray.length > 0 ? imgArray[0] : null;

    // Update the product with the first URL from the imgArray
    const updatedProduct = await Product.findByIdAndUpdate(
      pId,
      {
        title,
        description,
        img: firstImgUrl, // Use the first URL as the value for the img field
        category,
        stockQuantity,
        mrp,
        bv,
        dp,
        imgs: imgArray, // Optionally, you can still store the entire array in the imgs field
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).send("Failed to update product");
    }

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie("admintoken");
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

exports.customerDetails = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.render("admin/customer-details", { user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.sellerDetails = async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await Seller.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Seller not found" });
    }
    // console.log(user.orders.length);
    res.render("admin/seller-details", { user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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
    res.render("admin/userTree", { usersWithSameReferId, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCustomerOrderDetails = async (req, res) => {
  const userId = req.query.id;
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
  res.render("admin/customerOrderDetails", { user, orders });
};

exports.getsellerOrderDetails = async (req, res) => {
  const userId = req.query.id;
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
  res.render("admin/sellerOrderDetails", { seller, orders });
};

exports.calculateBV = async (req, res) => {
  try {
    const rootUser = await User.find({ referrer: "root" });

    const calculateBVRecursive = async (user) => {
      let totalBV = user.bv;
      user.childBv = 0;
      await user.save();

      const children = await User.find({ referrer: user.referId });
      for (const child of children) {
        let childBV = await calculateBVRecursive(child);
        if (!isNaN(childBV)) {
          user.childBv += childBV;
          await user.save();
          totalBV += childBV;
        }
      }
      if (isNaN(totalBV)) {
        totalBV = 0;
      }
      return totalBV;
    };

    for (const root of rootUser) {
      let x = await calculateBVRecursive(root);
      root.childBv = x - root.bv;
      await root.save();
    }
    res.render("admin/calculateBv");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.calculateE = async (req, res) => {
  const calculateEarn = (x, childEarnings) => {
    let totalEarnings = 0;
    if (x >= 200000) {
      totalEarnings += x * 0.45;
    } else if (x < 200000 && x >= 150000) {
      totalEarnings += x * 0.43;
    } else if (x < 150000 && x >= 90000) {
      totalEarnings += x * 0.39;
    } else if (x < 90000 && x >= 60000) {
      totalEarnings += x * 0.35;
    } else if (x < 60000 && x >= 35000) {
      totalEarnings += x * 0.31;
    } else if (x < 35000 && x >= 20000) {
      totalEarnings += x * 0.27;
    } else if (x < 20000 && x >= 12000) {
      totalEarnings += x * 0.23;
    } else if (x < 12000 && x >= 8000) {
      totalEarnings += x * 0.19;
    } else if (x < 8000 && x >= 5000) {
      totalEarnings += x * 0.15;
    } else if (x < 5000 && x >= 3000) {
      totalEarnings += x * 0.1;
    } else {
      totalEarnings += 0;
    }
    if (childEarnings) {
      totalEarnings -= childEarnings;
    }

    return totalEarnings;
  };

  const calculateBVRecursive = async (user) => {
    let totalChildEarnings = 0;
    const children = await User.find({ referrer: user.referId });
    for (const child of children) {
      let childE = await calculateBVRecursive(child);
      child.performanceEarnings = childE;
      await child.save();
      totalChildEarnings += childE;
    }
    return calculateEarn(user.bv + user.childBv, totalChildEarnings);
  };

  const rootUser = await User.find({ referrer: "root" });
  for (const root of rootUser) {
    let x = await calculateBVRecursive(root);
    root.performanceEarnings = x;
    await root.save();
  }

  res.render("admin/calculateBv");
};

exports.royalty = async (req, res) => {
  const calculateRoyalty = (x) => {
    if (x >= 1000000) {
      return x * 0.2;
    } else if (x < 1000000 && x >= 900000) {
      return x * 0.19;
    } else if (x < 900000 && x >= 800000) {
      return x * 0.175;
    } else if (x < 800000 && x >= 700000) {
      return x * 0.16;
    } else if (x < 700000 && x >= 600000) {
      return x * 0.14;
    } else if (x < 600000 && x >= 500000) {
      return x * 0.12;
    } else if (x < 500000 && x >= 400000) {
      return x * 0.095;
    } else if (x < 400000 && x >= 300000) {
      return x * 0.07;
    } else if (x < 300000 && x >= 200000) {
      return x * 0.04;
    } else {
      return 0;
    }
  };

  const allUser = await User.find();
  for (const user of allUser) {
    user.royaltyEarnings = 0;
    await user.save();
    if (user.referrer != "root") {
      let totalBv = user.bv + user.childBv;
      let royalty = calculateRoyalty(totalBv);
      const parent = await User.findOne({ referId: user.referrer });
      parent.royaltyEarnings += royalty;
      await parent.save();
    }
  }
  res.render("admin/calculateBv");
};

exports.global = async (req, res) => {
  const allUser = await User.find();
  for (const user of allUser) {
    user.totalBv = user.bv + user.childBv;
    await user.save();
  }
  const func3L = (children) => {
    // console.log(children[0].bv);
    let localPercent = 0;
    if (children[0].totalBv >= 300000) {
      children.shift();
      // console.log(children);
      let total = 0;
      for (const child of children) {
        total += child.totalBv;
        // console.log(total);
      }
      if (total >= 300000) {
        localPercent += 1;
      }
      return localPercent;
    } else {
      return 0;
    }
  };
  const func6L = (children) => {
    let localPercent = 0;
    console.log(children[0].totalBv);
    if (children[0].totalBv >= 600000) {
      children.shift();

      localPercent += func3L(children);
      console.log(localPercent);
      return localPercent + 1;
    } else {
      localPercent += func3L(children);
      return localPercent;
    }
  };
  const func12L = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 12000000) {
      children.shift();
      localPercent += func6L(children);
      return localPercent + 1;
    } else {
      localPercent += func6L(children);
      return localPercent;
    }
  };
  const func24L = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 24000000) {
      children.shift();
      localPercent += func12L(children);
      return localPercent + 0.5;
    } else {
      localPercent += func12L(children);
      return localPercent;
    }
  };
  const func50L = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 5000000) {
      children.shift();
      localPercent += func24L(children);
      return localPercent + 0.5;
    } else {
      localPercent += func24L(children);
      return localPercent;
    }
  };
  const func1Cr = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 10000000) {
      children.shift();
      localPercent += func50L(children);
      return localPercent + 0.5;
    } else {
      localPercent += func50L(children);
      return localPercent;
    }
  };
  const func2Cr = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 20000000) {
      children.shift();
      localPercent += func1Cr(children);
      return localPercent + 0.25;
    } else {
      localPercent += func1Cr(children);
      return localPercent;
    }
  };
  const func5Cr = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 50000000) {
      children.shift();
      localPercent += func2Cr(children);
      return localPercent + 0.25;
    } else {
      localPercent += func2Cr(children);
      return localPercent;
    }
  };
  const func10Cr = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 100000000) {
      children.shift();
      localPercent += func5Cr(children);
      return localPercent + 0.25;
    } else {
      localPercent += func5Cr(children);
      return localPercent;
    }
  };

  const func20Cr = (children) => {
    let localPercent = 0;
    if (children[0].totalBv >= 200000000) {
      children.shift();
      localPercent += func10Cr(children);
      return localPercent + 0.25;
    } else {
      localPercent += func10Cr(children);
      return localPercent;
    }
  };
  for (const user of allUser) {
    const children = await User.find({ referrer: user.referId }).sort({
      totalBv: -1,
    });
    let globalPercent = 0;
    if (children.length >= 3) {
      globalPercent += func6L(children);
      console.log(globalPercent, user.username);
    } else if (globalPercent == 0 && children.length >= 2) {
      globalPercent += func3L(children);
      console.log(globalPercent, user.username);
    }

    // if (globalPercent === 0 && children.length >= 10) {
    //   globalPercent += func10Cr(children);
    // }
  }
  res.render("admin/calculateBv");
};
