const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const userpayment = require("../controllers/payment");
const { restrictedArea } = require("../middlewares/sellerAuth");
router.get("/", sellerController.getIndex);
router.get("/loginPage", sellerController.loginPage);
router.get("/company", sellerController.comapnyDetails);
router.get("/cart", restrictedArea, sellerController.cart);
router.delete(
  "/product/:productId",
  restrictedArea,
  sellerController.removeFromCart
);
router.post(
  "/addToCart/:productId",
  restrictedArea,
  sellerController.addToCart
);
router.get("/allProduct", sellerController.allProduct);
router.get("/singleProduct", sellerController.singleProduct);
router.post("/login", sellerController.login);
router.post(
  "/updateCartQuantity",
  restrictedArea,
  sellerController.updateCartQuantity
);
router.post(
  "/buynowUpdateCartQuantity",
  restrictedArea,
  sellerController.buynowUpdateCartQuantity
);
router.get("/navprofile", restrictedArea, sellerController.navprofile);
router.get("/UserProfile", restrictedArea, sellerController.userprofile);
router.post("/edit", restrictedArea, sellerController.editUserProfile);
router.get("/logout", restrictedArea, sellerController.logout);

router.get("/buyNow", restrictedArea, sellerController.buyNow);

router.post(
  "/createOrder/:productId",
  restrictedArea,
  userpayment.createOrderForSeller
);
router.post(
  "/capturePayment",
  restrictedArea,
  userpayment.capturePaymentForSeller
);
router.post(
  "/createOrder",
  restrictedArea,
  userpayment.createOrderForSellerAddToCart
);
router.post(
  "/capturePayment/cart",
  restrictedArea,
  userpayment.capturePaymentForSellerAddToCart
);

router.post("/submit-address", sellerController.submitAddress);
router.post("/addBill", restrictedArea, sellerController.addBill);

router.get("/orderDetails", restrictedArea, sellerController.orderDetails);

module.exports = router;
