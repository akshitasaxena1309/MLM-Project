async function orderPaymentHandler(productId) {
  try {
    const response = await fetch(`/user/createOrder/${productId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const res = await response.json();
    handlePaymentResponse(res);
  } catch (error) {
    console.log("Error:", error.message);
    // Additional error handling if needed
  }
}

function initializeRazorpay(options) {
  const razorpayObject = new Razorpay(options);
  razorpayObject.on("payment.failed", handlePaymentFailure);
  razorpayObject.open();
}

function handlePaymentResponse(res) {
  if (res.success) {
    const options = {
      productId: res.productId,
      key: res.key_id,
      amount: res.amount,
      currency: "INR",
      name: res.product_name,
      description: res.description,
      order_id: res.order_id,
      handler: (paymentResponse) => handlePaymentSuccess(paymentResponse, res),
      prefill: {
        contact: res.phone,
        name: res.username,
        email: res.email,
      },
      notes: {
        description: res.description,
      },
      theme: {
        color: "#2300a3",
      },
    };

    initializeRazorpay(options);
  }
}

async function handlePaymentSuccess(paymentResponse, res) {
  try {
    const captureResponse = await fetch(`/user/capturePayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        ProductId: res.productId,
      }),
    });

    if (!captureResponse.ok) {
      throw new Error(
        `Failed to capture payment: ${captureResponse.statusText}`
      );
    }

    const capturedData = await captureResponse.json();
    // Process captured data as needed
  } catch (error) {
    console.error("Error:", error.message);
    // Handle the error, e.g., show an error message to the user
  }
}

function handlePaymentFailure(response) {
  alert("Payment Failed");
}

// payment handler for add to cart items
// cart payment
async function orderPaymentHandlerForAddToCart() {
  try {
    const response = await fetch(`/user/createOrder`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const res = await response.json();
    handlePaymentResponseForAddToCart(res);
  } catch (error) {
    console.log("Error:", error.message);
    // Additional error handling if needed
  }
}

function handlePaymentResponseForAddToCart(res) {
  if (res.success) {
    const options = {
      key: res.key_id,
      amount: res.amount,
      currency: "INR",
      name: res.product_name,
      description: res.description,
      order_id: res.order_id,
      handler: handlePaymentSuccessForAddToCart,
      prefill: {
        contact: res.phone,
        name: res.username,
        email: res.email,
      },
      notes: {
        description: res.description,
      },
      theme: {
        color: "#2300a3",
      },
    };

    initializeRazorpay(options);
  }
}

async function handlePaymentSuccessForAddToCart(paymentResponse) {
  try {
    const captureResponse = await fetch("/user/capturePayment/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        { id: paymentResponse.razorpay_payment_id },
        { signature: paymentResponse.razorpay_signature },
        { razorpayOrderId: paymentResponse.razorpay_order_id }
      ),
    });

    if (!captureResponse.ok) {
      throw new Error(
        `Failed to capture payment: ${captureResponse.statusText}`
      );
    }

    const capturedData = await captureResponse.json();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// seller payment getway

async function orderPaymentHandlerForSeller(productId) {
  try {
    const response = await fetch(`/seller/createOrder/${productId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const res = await response.json();

    handlePaymentResponseForSeller(res);
  } catch (error) {
    console.log("Error:", error.message);
    // Additional error handling if needed
  }
}

function handlePaymentResponseForSeller(res) {
  if (res.success) {
    const options = {
      productId: res.productId,
      key: res.key_id,
      amount: res.amount,
      currency: "INR",
      name: res.product_name,
      description: res.description,
      order_id: res.order_id,
      handler: (paymentResponse) =>
        handlePaymentSuccessForSeller(paymentResponse, res),
      prefill: {
        contact: res.phone,
        name: res.username,
        email: res.email,
      },
      notes: {
        description: res.description,
      },
      theme: {
        color: "#2300a3",
      },
    };

    initializeRazorpay(options);
  }
}

async function handlePaymentSuccessForSeller(paymentResponse, res) {
  try {
    const captureResponse = await fetch(`/seller/capturePayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        purchasedProductId: res.productId,
      }),
    });

    if (!captureResponse.ok) {
      throw new Error(
        `Failed to capture payment: ${captureResponse.statusText}`
      );
    }

    const capturedData = await captureResponse.json();
    // Process captured data as needed
  } catch (error) {
    console.error("Error:", error.message);
    // Handle the error, e.g., show an error message to the user
  }
}

// seller payment for add to cart
async function orderPaymentHandlerForSellerAddToCart() {
  try {
    const response = await fetch(`/seller/createOrder`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const res = await response.json();
    handlePaymentResponseForSellerAddToCart(res);
  } catch (error) {
    console.log("Error:", error.message);
    // Additional error handling if needed
  }
}

function handlePaymentResponseForSellerAddToCart(res) {
  if (res.success) {
    const options = {
      key: res.key_id,
      amount: res.amount,
      currency: "INR",
      name: res.product_name,
      description: res.description,
      order_id: res.order_id,
      handler: handlePaymentSuccessForSellerAddToCart,
      prefill: {
        contact: res.phone,
        name: res.username,
        email: res.email,
      },
      notes: {
        description: res.description,
      },
      theme: {
        color: "#2300a3",
      },
    };

    initializeRazorpay(options);
  }
}

async function handlePaymentSuccessForSellerAddToCart(paymentResponse) {
  try {
    const captureResponse = await fetch("/seller/capturePayment/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        { id: paymentResponse.razorpay_payment_id },
        { signature: paymentResponse.razorpay_signature },
        { razorpayOrderId: paymentResponse.razorpay_order_id }
      ),
    });

    if (!captureResponse.ok) {
      throw new Error(
        `Failed to capture payment: ${captureResponse.statusText}`
      );
    }

    const capturedData = await captureResponse.json();
  } catch (error) {
    console.error("Error:", error.message);
  }
}
