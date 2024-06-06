const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userpayment = require("../controllers/payment");
const { restrictedArea } = require("../middlewares/userAuth");

router.get("/", userController.getIndex);
router.get("/allProduct", userController.allProduct);
router.get("/singleProduct", userController.singleProduct);
router.get("/singlecategory", userController.singleCategory);
router.get("/company", userController.comapnyDetails);

router.get("/cart", restrictedArea, userController.cart);
router.get("/signupPage", userController.signupPage);
router.get("/loginPage", userController.loginPage);
router.post("/signup", userController.sign);
router.post("/login", userController.login);
router.post("/addToCart/:productId", restrictedArea, userController.addToCart);
router.get("/buyNow", restrictedArea, userController.buyNow);
router.post(
  "/updateCartQuantity",
  restrictedArea,
  userController.updateCartQuantity
);
router.post(
  "/buynowUpdateCartQuantity",
  restrictedArea,
  userController.buynowUpdateCartQuantity
);

router.get("/navprofile", restrictedArea, userController.navprofile);
router.get("/userProfile", restrictedArea, userController.userProfile);
router.get("/orderDetails", restrictedArea, userController.orderDetails);
router.post("/edit", restrictedArea, userController.editUserProfile);

router.delete(
  "/product/:productId",
  restrictedArea,
  userController.removeFromCart
);
router.get("/logout", restrictedArea, userController.logout);

router.post("/createOrder/:productId", restrictedArea, userpayment.createOrder);
router.post(
  "/createOrder",
  restrictedArea,
  userpayment.createOrderforAddToCart
);
router.post("/capturePayment", restrictedArea, userpayment.capturePayment);
router.post(
  "/capturePayment/cart",
  restrictedArea,
  userpayment.capturePaymentForAddToCart
);
router.post("/submit-address", userController.submitAddress);
router.get("/userprofile/usertree", restrictedArea, userController.userTree);
module.exports = router;
