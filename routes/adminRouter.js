// routes/adminRouter.js

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");

router.get("/", adminController.getLogin);
router.get("/index", isLoggedIn, isAdmin, adminController.getIndex);
router.get("/products", isLoggedIn, isAdmin, adminController.getProducts);
router.post("/login", adminController.login);
router.get("/Registration", adminController.Registration);
router.post("/signup", adminController.signup); //baad me add krni h idhr middlewares

router.post("/userSignup", isLoggedIn, isAdmin, adminController.userSignup);
router.get("/orders", isLoggedIn, isAdmin, adminController.getOrders);
router.get("/customers", isLoggedIn, isAdmin, adminController.getCustomers);
router.get("/sellers", isLoggedIn, isAdmin, adminController.getSellers);
router.get("/newUser", isLoggedIn, isAdmin, adminController.newUser);
router.get("/newSeller", isLoggedIn, isAdmin, adminController.newSeller);
router.post("/sellerSignup", isLoggedIn, isAdmin, adminController.sellerSignup);
router.get("/add-product", isLoggedIn, isAdmin, adminController.getAddProduct);
router.get(
  "/edit-product/:pId",
  isLoggedIn,
  isAdmin,
  adminController.getEditProduct
);
router.post("/products/edit", isLoggedIn, isAdmin, adminController.editProduct);
router.get(
  "/add-categories",
  isLoggedIn,
  isAdmin,
  adminController.getAddCategories
);

router.post("/products/add", isLoggedIn, isAdmin, adminController.addProduct);
router.post(
  "/categories/add",
  isLoggedIn,
  isAdmin,
  adminController.addCategories
);
router.post("/products/edit", isLoggedIn, isAdmin, adminController.addProduct);

router.get("/categories", isLoggedIn, isAdmin, adminController.getCategories);
router.delete(
  "/products/:productId",
  isLoggedIn,
  isAdmin,
  adminController.deleteProduct
);
router.delete(
  "/categories/:categoryId",
  isLoggedIn,
  isAdmin,
  adminController.deleteCategory
);
router.get(
  "/viewdetails/:leadId",
  isLoggedIn,
  isAdmin,
  adminController.viewProduct
);
router.post(
  "/categories/edit",
  isLoggedIn,
  isAdmin,
  adminController.editCategory
);

router.get(
  "/customers/details",
  isLoggedIn,
  isAdmin,
  adminController.customerDetails
);
router.get(
  "/sellers/details",
  isLoggedIn,
  isAdmin,
  adminController.sellerDetails
);
router.get("/logout", isLoggedIn, isAdmin, adminController.logout);
router.get("/customers/tree", isLoggedIn, isAdmin, adminController.userTree);

router.get(
  "/customerOrderDetails",
  isLoggedIn,
  isAdmin,
  adminController.getCustomerOrderDetails
);

router.get(
  "/sellerOrderDetails",
  isLoggedIn,
  isAdmin,
  adminController.getsellerOrderDetails
);
router.get("/calculateBV", isLoggedIn, isAdmin, adminController.calculateBV);
router.get("/calculateE", isLoggedIn, isAdmin, adminController.calculateE);
router.get("/royalty", isLoggedIn, isAdmin, adminController.royalty);
router.get("/global", isLoggedIn, isAdmin, adminController.global);
module.exports = router;
