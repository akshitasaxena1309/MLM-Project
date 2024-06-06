const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Product = require("../models/product");
const Razorpay = require("razorpay");
const Seller = require("../models/seller");
const Razorpay_key = process.env.RAZORPAY_KEY;
const Razorpay_SECRET = process.env.RAZORPAY_SECRET;
const instance = new Razorpay({
  key_id: Razorpay_key,
  key_secret: Razorpay_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const productId = req.params.productId;

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const product = await Product.findOne({ _id: productId });
    const user = await User.findOne({ _id: userId });
    const productQunatity = user.buynow.quantity;

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const amount = product.dp * productQunatity;

    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      payment_capture: 1,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    };

    const response = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      productId: productId,
      productName: product.title, // Adjust property name based on your product schema
      orderId: response.id,
      currency: response.currency,
      amount: response.amount,
      key_id: Razorpay_key,
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error("Razorpay Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};

exports.capturePayment = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  try {
    const user = await User.findOne({ _id: userId });
    const userBv = user.bv;

    const productQuantity = user.buynow.quantity;
    const paymentId = req.body.id;

    const productId = req.body.ProductId;
    const product = await Product.findOne({ _id: productId });
    const productBv = product.bv * productQuantity;

    const paymentResponse = await instance.payments.fetch(paymentId);
    const { id, amount, currency } = paymentResponse;
    const paymentCapture = await instance.payments.capture(
      id,
      amount,
      currency
    );
    const buyAmount = paymentCapture.amount / 100;

    const { status } = paymentCapture;
    console.log(status);

    const newOrder = {
      orderNumber: paymentCapture.id,
      products: [
        {
          product: productId,
          quantity: productQuantity,
        },
      ],
      totalAmount: buyAmount,
    };

    const newBv = userBv + productBv;

    const updateData = {
      $push: {
        orders: { $each: [newOrder] },
      },
      $set: { bv: newBv }, // Set 'bv' directly as a Number
    };

    if (status === "captured") {
      await User.findByIdAndUpdate({ _id: userId }, updateData, { new: true });
    }

    res.status(200).json({
      message: "Payment captured successfully",
      paymentId,
      id,
      amount,
      currency,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createOrderforAddToCart = async (req, res) => {
  try {
    // Fetch the user id using JSON web token
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Ensure userId is present
    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch user data from the database
    const user = await User.findOne({ _id: userId });

    // Access the cart array in the user object
    const userCart = user.cart;

    // Calculate total amount for all cart products
    const promises = userCart.map(async (cartItem) => {
      const productId = cartItem.product;
      const quantity = cartItem.quantity;

      const product = await Product.findOne({ _id: productId });
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const singleProductAmount = product.dp * quantity;
      return singleProductAmount;
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Calculate total amount from the results
    const totalAmount = results.reduce((acc, amount) => acc + amount, 0);

    // Create Razorpay order
    const currency = "INR";
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency,
      receipt: Math.random(Date.now()).toString(),
      payment_capture: 1,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    };

    const response = await instance.orders.create(options);

    // Respond with the extracted data
    return res.status(200).json({
      success: true,
      orderId: response.id,
      currency: response.currency,
      amount: response.amount,
      key_id: Razorpay_key,
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
};

exports.capturePaymentForAddToCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findOne({ _id: userId });
    let userCart = user.cart;

    // Update BV and calculate totalAmount in parallel
    const promises = userCart.map(async (cartItem) => {
      const productId = cartItem.product;
      const quantity = cartItem.quantity;

      const product = await Product.findOne({ _id: productId });
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      return product.bv * quantity;
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Update BV for the user
    const updatedBv = results.reduce((acc, bv) => acc + bv, 0);
    user.bv += updatedBv;

    // Calculate totalAmount based on the results
    // const totalAmount = results.reduce((acc, bv) => acc + bv, 0) / 100; // Assuming the amount is in cents

    const paymentId = req.body.id;
    const paymentResponse = await instance.payments.fetch(paymentId);
    const { id, amount, currency } = paymentResponse;

    const paymentCapture = await instance.payments.capture(
      id,
      amount,
      currency
    );
    const buyAmount = paymentCapture.amount / 100;
    const { status } = paymentCapture;
    console.log(status);

    if (status === "captured") {
      const newOrder = {
        orderNumber: paymentCapture.id,
        products: userCart.map((cartItem) => ({
          product: cartItem.product,
          quantity: cartItem.quantity,
        })),
        totalAmount: buyAmount,
      };

      // Update the user's orders and empty the cart
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            orders: { $each: [newOrder] },
          },
          $set: {
            cart: [], // Empty the cart
            bv: user.bv, // Update the user's BV
          },
        },
        { new: true }
      );

      res.status(200).json({
        message: "Payment captured successfully",
        paymentId,
        id,
        amount,
        currency,
        totalAmount,
        user: updatedUser,
      });
    } else {
      res.status(400).json({ error: "Payment not captured" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createOrderForSeller = async (req, res) => {
  try {
    const productId = req.params.productId;
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;

    const product = await Product.findOne({ _id: productId });
    const seller = await Seller.findOne({ _id: sellerId });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "seller not found" });
    }
    const productQunatity = seller.buynow.quantity;

    const amount = product.dp * productQunatity;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      payment_capture: 1,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    };

    const response = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      productId: productId,
      productName: product.title, // Adjust property name based on your product schema
      orderId: response.id,
      currency: response.currency,
      amount: response.amount,
      key_id: Razorpay_key,
      username: seller.username,
      email: seller.email,
      phone: seller.phone,
    });
  } catch (error) {
    console.error("Razorpay Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};

exports.capturePaymentForSeller = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;
    const seller = await Seller.findOne({ _id: sellerId });
    const productQuantity = seller.buynow.quantity;

    const paymentId = req.body.id;
    const productId = req.body.purchasedProductId;

    const paymentResponse = await instance.payments.fetch(paymentId);
    const { id, amount, currency } = paymentResponse;
    const paymentCapture = await instance.payments.capture(
      id,
      amount,
      currency
    );
    const { status } = paymentCapture;

    const newOrder = {
      orderNumber: paymentCapture.id,
      products: [
        {
          product: productId,
          quantity: productQuantity,
        },
      ],
      totalAmount: paymentCapture.amount,
    };

    const newStock = {
      product: productId,
      quantity: productQuantity,
    };

    const existingProductIndex = seller.stock.findIndex(
      (stockItem) => stockItem.product.toString() === productId.toString()
    );

    if (existingProductIndex !== -1) {
      // Product already exists, update quantity
      const updatedQuantity =
        seller.stock[existingProductIndex].quantity + productQuantity;

      const updateData = {
        $push: {
          orders: { $each: [newOrder] },
        },
        $set: {
          "stock.$.quantity": updatedQuantity,
        },
      };

      if (status === "captured") {
        await Seller.findOneAndUpdate(
          { _id: sellerId, "stock.product": productId },
          updateData,
          { new: true }
        );
      }
    } else {
      // Product does not exist, add new entry
      const updateData = {
        $push: {
          orders: { $each: [newOrder] },
          stock: { $each: [newStock] },
        },
      };

      if (status === "captured") {
        await Seller.findByIdAndUpdate({ _id: sellerId }, updateData, {
          new: true,
        });
      }
    }

    res.status(200).json({
      message: "Payment captured successfully",
      paymentId,
      id,
      amount,
      currency,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createOrderForSellerAddToCart = async (req, res) => {
  try {
    // Fetch the user id using JSON web token
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;

    // Ensure userId is present
    if (!sellerId) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch user data from the database
    const seller = await Seller.findOne({ _id: sellerId });

    // Access the cart array in the user object
    const sellerCart = seller.cart;

    // Calculate total amount for all cart products
    const promises = sellerCart.map(async (cartItem) => {
      const productId = cartItem.product;
      const quantity = cartItem.quantity;

      const product = await Product.findOne({ _id: productId });
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const singleProductAmount = product.dp * quantity;
      return singleProductAmount;
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Calculate total amount from the results
    const totalAmount = results.reduce((acc, amount) => acc + amount, 0);

    // Create Razorpay order
    const currency = "INR";
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency,
      receipt: Math.random(Date.now()).toString(),
      payment_capture: 1,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    };

    const response = await instance.orders.create(options);

    // Respond with the extracted data
    return res.status(200).json({
      success: true,
      orderId: response.id,
      currency: response.currency,
      amount: response.amount,
      key_id: Razorpay_key,
      username: seller.username,
      email: seller.email,
      phone: seller.phone,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
};

exports.capturePaymentForSellerAddToCart = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;

    const seller = await Seller.findOne({ _id: sellerId });
    const sellerCart = seller.cart;

    const paymentId = req.body.id;
    const paymentResponse = await instance.payments.fetch(paymentId);
    const { id, amount, currency } = paymentResponse;

    const paymentCapture = await instance.payments.capture(
      id,
      amount,
      currency
    );
    const { status } = paymentCapture;

    if (status === "captured") {
      const newOrder = {
        orderNumber: paymentCapture.id,
        products: sellerCart.map((cartItem) => ({
          product: cartItem.product,
          quantity: cartItem.quantity,
        })),
        totalAmount: paymentCapture.amount,
      };

      const newStock = sellerCart.map((cartItem) => {
        const existingProductIndex = seller.stock.findIndex(
          (stockItem) =>
            stockItem.product.toString() === cartItem.product.toString()
        );

        if (existingProductIndex !== -1) {
          // Product already exists, update quantity
          const updatedQuantity =
            seller.stock[existingProductIndex].quantity + cartItem.quantity;

          return {
            product: cartItem.product,
            quantity: updatedQuantity,
          };
        } else {
          // Product does not exist, add new entry
          return {
            product: cartItem.product,
            quantity: cartItem.quantity,
          };
        }
      });

      const updatedSeller = await Seller.findByIdAndUpdate(
        sellerId,
        {
          $push: {
            orders: { $each: [newOrder] },
          },
          $set: {
            stock: newStock,
          },
        },
        { new: true }
      );

      res.status(200).json({
        message: "Payment captured successfully",
        paymentId,
        id,
        amount,
        currency,
        seller: updatedSeller,
      });
    } else {
      res.status(400).json({ error: "Payment not captured" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
