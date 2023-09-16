const express = require('express')
const session = require('express-session')
const auth = require('../middleware/adminAuth');
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
admin_Router.get('/',auth.isLogout,adminController.adminLoginPage);
admin_Router.post('/adminlogin',adminController.adminLogin)
// adminLogout
admin_Router.post('/adminlogout',adminController.adminLogout)
// //admin panel routes
admin_Router.get('/adminpanel', auth.isLogin,adminController.adminPanel);

// Manage Usres
admin_Router.get('/userdash', auth.isLogin,adminController.userManage);
// Block Usres
admin_Router.get('/blockUser', auth.isLogin,adminController.blockUser);

// Load categoty page
admin_Router.get('/category', auth.isLogin,categoryController.loadCategory);
// Add new category
admin_Router.post('/addCat', upload.array('img',2) ,categoryController.addCat)
// Add new category
admin_Router.post('/addImage', upload.array('img', 2), categoryController.addImage)
// Edit current category
admin_Router.post('/editCat', upload.array('img', 2),categoryController.editCat)
// delete category images
admin_Router.get('/deletecatimg', auth.isLogin,categoryController.deletecatimg)
// List and unlist category
admin_Router.get('/unlist', auth.isLogin,categoryController.unlist)

//Loading products page
admin_Router.get('/product', auth.isLogin,productController.loadPage);
// Add product page
admin_Router.get('/addproduct', auth.isLogin,productController.addProduct);
// Unlist Product
admin_Router.get('/unlistprdt', auth.isLogin,productController.unlistPrdt)
// Edit products
admin_Router.get('/editproduct', auth.isLogin,productController.editProduct)
// Update edited products
admin_Router.post('/productupdate',upload.array('img',4),productController.productUpdate)
// Delete images
admin_Router.get('/deleteimg', auth.isLogin,productController.deleteimg)
// Add product page
admin_Router.post('/newproduct',upload.array('img',4),productController.newProduct);

// List orders
admin_Router.get('/Orders', auth.isLogin,orderController.orderList)
// Load detail page of order
admin_Router.get('/orderDetails', auth.isLogin,orderController.orderDetails2)
// Load detail page of order
admin_Router.post('/update-order-status',orderController.updateStatus)
// approve Return product
admin_Router.post('/approvereturn', orderController.approveReturn)

// Load coupon page
admin_Router.get('/coupons', auth.isLogin,couponController.viewCoupons)
// Load add new coupon page
admin_Router.get('/coupons/addnewCoupon', auth.isLogin,couponController.addCouponspg)
// add new coupon db
admin_Router.post('/addCoupon',couponController.addCoupons)
// edit coupon page
admin_Router.get('/editCoupon', auth.isLogin,couponController.editCouponpg)
// Add the update to the db
admin_Router.post('/updateCoupon',couponController.EditCoupons)
// unlist the coupon
admin_Router.get('/coupon/unlist', auth.isLogin,couponController.unlistCoupons)

// Load Banner page
admin_Router.get('/banners', auth.isLogin,bannerController.loadBanners)
// add new banners
admin_Router.post(
  "/newbanners",
  upload.single("img"),
  bannerController.addBanners
);

// Load offer page
admin_Router.get('/offers', auth.isLogin,offerController.offerpage)
// load the add offer page
admin_Router.get("/offers/addoffer", auth.isLogin, offerController.addOfferpage);
// add the new offer data to db
admin_Router.post("/addoffer", offerController.addOffer);
// Load the edit offer page
admin_Router.get("/offers/editoffer", auth.isLogin,offerController.editOfferpage);
// make the chages to the db
admin_Router.post("/editoffer/:id", offerController.editOffer);
// List and Unlist the offer
admin_Router.get("/offers/unlist", auth.isLogin,offerController.unlist);

// add category offer
admin_Router.post('/applyoffer',categoryController.applyOffer)
// remove category offer
admin_Router.post('/removeoffer', categoryController.removeOffer)

// add offer to products
admin_Router.post('/productoffer', productController.productOffer)
// // remove offer from products
admin_Router.post('/productofrrm', productController.removeOffer)

module.exports = admin_Router;