const express = require('express')
const session = require('express-session')
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const bannerController = require("../controllers/BannerController");
const offerController = require("../controllers/offerController");
const multer =require('multer')
const path = require('path');
const crypto = require('crypto');
const admin_Router = express();
// const adminAuth = require('../middleware/adminAuth')

// crypto to create random key for sessions
const secret=crypto.randomBytes(64).toString('hex');
// session middleware
admin_Router.use(session({
  secret:secret,
  resave:false,
  saveUninitialized:false
}));

// ser view folder
admin_Router.set('view engine','ejs');
admin_Router.set('views','./views/admin');

// upload images
const storage = multer.diskStorage({
    destination:'public/img/',
    filename : (req,file,cb) =>{
        // cb(null,Date.now(+file+originalname));
        cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
  });

//admin login routes
admin_Router.get('/',adminController.adminLoginPage);
admin_Router.post('/adminlogin',adminController.adminLogin)
// adminLogout
admin_Router.post('/adminlogout',adminController.adminLogout)
// //admin panel routes
admin_Router.get('/adminpanel',adminController.adminPanel);

// Manage Usres
admin_Router.get('/userdash',adminController.userManage);
// Block Usres
admin_Router.get('/blockUser',adminController.blockUser);

// Load categoty page
admin_Router.get('/category',categoryController.loadCategory);
// Add new category
admin_Router.post('/addCat',categoryController.addCat)
// Edit current category
admin_Router.post('/editCat',categoryController.editCat)
// List and unlist category
admin_Router.get('/unlist',categoryController.unlist)

//Loading products page
admin_Router.get('/product',productController.loadPage);
// Add product page
admin_Router.get('/addproduct',productController.addProduct);
// Unlist Product
admin_Router.get('/unlistprdt',productController.unlistPrdt)
// Edit products
admin_Router.get('/editproduct',productController.editProduct)
// Update edited products
admin_Router.post('/productupdate',upload.array('img',4),productController.productUpdate)
// Delete images
admin_Router.get('/deleteimg',productController.deleteimg)
// Add product page
admin_Router.post('/newproduct',upload.array('img',4),productController.newProduct);

// List orders
admin_Router.get('/Orders',orderController.orderList)
// Load detail page of order
admin_Router.get('/orderDetails',orderController.orderDetails2)
// Load detail page of order
admin_Router.post('/update-order-status',orderController.updateStatus)
// approve Return product
admin_Router.post('/approvereturn', orderController.approveReturn)

// Load coupon page
admin_Router.get('/coupons',couponController.viewCoupons)
// Load add new coupon page
admin_Router.get('/coupons/addnewCoupon',couponController.addCouponspg)
// add new coupon db
admin_Router.post('/addCoupon',couponController.addCoupons)
// edit coupon page
admin_Router.get('/editCoupon',couponController.editCouponpg)
// Add the update to the db
admin_Router.post('/updateCoupon',couponController.EditCoupons)
// unlist the coupon
admin_Router.get('/coupon/unlist',couponController.unlistCoupons)

// Load Banner page
admin_Router.get('/banners',bannerController.loadBanners)
// add new banners
admin_Router.post(
  "/newbanners",
  upload.single("img"),
  bannerController.addBanners
);

// Load offer page
admin_Router.get('/offers',offerController.offerpage)
// load the add offer page
admin_Router.get("/offers/addoffer", offerController.addOfferpage);
// add the new offer data to db
admin_Router.post("/addoffer", offerController.addOffer);
// Load the edit offer page
admin_Router.get("/offers/editoffer", offerController.editOfferpage);
// make the chages to the db
admin_Router.post("/editoffer/:id", offerController.editOffer);
// List and Unlist the offer
admin_Router.get("/offers/unlist", offerController.unlist);

// add category offer
admin_Router.post('/applyoffer',categoryController.applyOffer)
// remove category offer
admin_Router.post('/removeoffer', categoryController.removeOffer)

// add offer to products
admin_Router.post('/productoffer', productController.productOffer)
// // remove offer from products
admin_Router.post('/productofrrm', productController.removeOffer)

module.exports = admin_Router;