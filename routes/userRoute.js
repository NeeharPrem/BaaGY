const express=require('express');
const session=require('express-session');
const auth=require('../middleware/userAuth');
const userController=require('../controllers/userController');
const addressController=require('../controllers/addressController')
const cartController=require('../controllers/cartController')
const orderController=require('../controllers/orderController')
const couponController=require('../controllers/couponController')
const jwt=require('../middleware/jwt')
const crypto = require('crypto');
const router = express();

// crypto to create random key for sessions
const secret=crypto.randomBytes(64).toString('hex');
// session middleware
router.use(session({
  secret:secret,
  resave:false,
  saveUninitialized:false
}));

// set view folder
router.set('view engine','ejs');
router.set('views','./views/user');

// Load Homepage
router.get('/',userController.loadHome);

// Load login page
router.get('/login',auth.isLogout,userController.loadLogin);
// Logingin to Home
router.post('/loggingin',userController.verifyLogin);

// signup
// Laod signup page
router.get('/signup',auth.isLogout,userController.loadSignup);
// user signup action
router.post('/signup',userController.insertUser);
// otp verification
router.post('/verifyOtp',userController.verifyOtp);

// forget pass
// forget password email page
router.get('/resetpass',userController.forgetpass)
// sent otp for forget pass
router.post('/sentOtp',userController.sentOtp)
// sent otp for forget pass
router.get('/resentOtp',userController.resentOtp)
// Enter otp and verify
router.post('/otpverify',userController.resetpassOtp)
// Enter new password
router.post('/newpass',userController.newpass)

// profile
// show user profile
router.get('/profile', jwt.signinverify, auth.isLogin,userController.profile)
// user wallet info
router.get('/wallet', auth.isLogin,userController.getWallet)
// Edit user profile
router.get('/editprofile', jwt.signinverify,auth.isLogin,userController.editprofile)
// update uer db with new data
router.post('/userupdate', jwt.signinverify,auth.isLogin,userController.userupdate)
// Load changepassword page
router.get('/editpass', jwt.signinverify, auth.isLogin,userController.editpass)
// Update the password
router.post('/passupdate',auth.isLogin,userController.passupdate)
// Load user address and edit page
router.get('/address',jwt.signinverify,auth.isLogin,addressController.loadAddress)
// Load address form
router.get('/getform', jwt.signinverify,auth.isLogin,addressController.loadForm)
// Add user address to db
router.post('/addaddress',addressController.adddata)
// Load edit current address page
router.post('/edit',addressController.editAddress)
// update the current address
router.post('/updateadrs',addressController.updateAddress)
// Remove address from db
router.post('/removeadrs',addressController.removeAdrs)

// shop
// shop page
router.get('/shop',userController.loadShop)
// product detail page
router.get('/getproduct',userController.showProduct)

// cart
// Add product to cart
router.post('/addtocart',cartController.addtoCart)
// load shoping cart page
router.get('/loadcart',jwt.signinverify,cartController.loadCart)
// updating the cart items
router.put('/newcart',cartController.updateCart)
// remove product from the cart
router.post('/delete',cartController.deleteItem)

// checkout page
// checkout page
router.get('/checkout',jwt.signinverify,orderController.loadCheckout)

// add address from checkout page
router.get('/getforms',addressController.loadForms)
// insert user address to db
router.post('/newaddress',addressController.adddatas)
// edit address from checkout page
router.get('/editadrs',addressController.editAddress1)
// update edited address in checkout page
router.post('/checkoutupdateadrs',addressController.updateAddress1)
// remove address from checkout page
router.get('/removeadrr',addressController.removeAdrr)

// order
// place the order
router.post('/placeorder',orderController.placeOrder)
// apply coupons
router.post('/applycpn',couponController.applyCoupon)
// Remove coupons
router.get('/removecpn',couponController.removeCoupon)
// place order using Razorpay
router.post('/verifyPayment',orderController.verifyPayment)
// user order management
router.get('/orders', auth.isLogin,orderController.loadOrders)
// load payment success page
router.get("/success", auth.isLogin,userController.success);
// load payment failed page
router.get("/failed", auth.isLogin,userController.failed);
// user order details page
router.get('/viewDetails', auth.isLogin,orderController.orderDetails)
// cancell the order
router.get('/cancelorder', auth.isLogin,orderController.cancelOrder)
// cacel individual item from the order
router.post('/cancelproduct', orderController.cancelProduct)
// Return order
router.get('/returnorder', auth.isLogin,orderController.returnOrder)
// Return order
router.post('/returnproduct',orderController.returnProduct)
// download invoice
router.post('/downloadInvoice',orderController.downloadInvoice)

// wishlist
// Add products to wishlist
router.get('/towishlist',auth.isLogin,userController.toWishlist)
// Remove product from wishlist
router.all('/outWishlist', auth.isLogin,userController.outWishlist)
// load wishlist page
router.get('/wishlist', auth.isLogin,userController.loadWishlist)

// zoom test
router.get('/zoom', userController.zoom)

// user logout
router.post('/logout',userController.logout)

module.exports=router;