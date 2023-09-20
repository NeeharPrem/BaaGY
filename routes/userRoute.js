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
const nocache = require('nocache')

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
router.all('/verifyOtp',userController.verifyOtp);
// sent otp for signup
router.get('/resentotp', userController.resentOtp1)

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
router.get('/profile', auth.isLogin,jwt.signinverify,userController.profile)
// user wallet info
router.get('/wallet', auth.isLogin,userController.getWallet)
// Edit user profile
router.get('/editprofile', auth.isLogin,jwt.signinverify,userController.editprofile)
// update uer db with new data
router.post('/userupdate', jwt.signinverify,auth.isLogin,userController.userupdate)
// Load changepassword page
router.get('/editpass', auth.isLogin,jwt.signinverify,userController.editpass)
// Update the password
router.post('/passupdate',auth.isLogin,userController.passupdate)
// Load user address and edit page
router.get('/address', auth.isLogin,jwt.signinverify,addressController.loadAddress)
// Load address form
router.get('/getform', auth.isLogin,jwt.signinverify,addressController.loadForm)
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
router.post('/addtocart', auth.isLogin,cartController.addtoCart)
// load shoping cart page
router.get('/loadcart',auth.isLogin,jwt.signinverify,cartController.loadCart)
// updating the cart items
router.put('/newcart', auth.isLogin,cartController.updateCart)
// remove product from the cart
router.post('/delete',cartController.deleteItem)

// checkout page
// checkout page
router.get('/checkout', auth.isLogin,jwt.signinverify,orderController.loadCheckout)

// add address from checkout page
router.get('/getforms',auth.isLogin,addressController.loadForms)
// insert user address to db
router.post('/newaddress',addressController.adddatas)
// edit address from checkout page
router.get('/editadrs', auth.isLogin,addressController.editAddress1)
// update edited address in checkout page
router.post('/checkoutupdateadrs',addressController.updateAddress1)
// remove address from checkout page
router.get('/removeadrr', auth.isLogin,addressController.removeAdrr)

// order
// place the order
router.post('/placeorder', nocache(),orderController.placeOrder)
// apply coupons
router.post('/applycpn',couponController.applyCoupon)
// Remove coupons
router.post('/removecpn', auth.isLogin,couponController.removeCoupon)
// place order using Razorpay
router.post('/verifyPayment',orderController.verifyPayment)
// user order management
router.get('/orders',auth.isLogin,orderController.loadOrders)
// load payment success page
router.get("/success",nocache(),auth.isLogin,userController.success);
// load payment failed page
router.get("/failed",nocache(),auth.isLogin,userController.failed);
// user order details page
router.get('/viewDetails', auth.isLogin,orderController.orderDetails)
// cancell the order
router.get('/cancelorder',auth.isLogin,orderController.cancelOrder)
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

// About
router.get('/about',userController.about)

// contact form
router.get('/contact',userController.contactus)
// submit contact form
router.post('/contactus',userController.contactsubmit)

// user logout
router.post('/logout',userController.logout)

module.exports=router;