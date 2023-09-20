const user = require("../model/usermodel");
const User=user
const category = require("../model/categorymodel");
const Cat = category;
const product = require("../model/productmodel");
const Products = product;
const carts = require("../model/cartmodel");
const Cart = carts;
const address = require("../model/addressmodel");
const Address = address;
const Orders = require("../model/ordermodel");
const Order = Orders;
const banners = require("../model/bannermodel");
const Banner = banners;
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// jwt

// Home page controller
exports.loadHome = async (req, res,next) => {
  try {
    const id = req.session.user_id;
    const user=await User.find({_id:id})
    if (user.length > 0){
      let length= user[0].wishlist.length
      if(length>0){
        req.session.wishlist=length
      }else{
        req.session.wishlist=0
      }
    }
    const wish= req.session.wishlist
    const banner = await Banner.find({});
    const products= await Products.find({})
    res.render("Home", { user:user,banner:banner,products:products,wish});
  } catch (error) {
    next(error.message);
  }
};

// signup page controller
exports.loadSignup = async (req, res,next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const user=""
    res.render("userSignup", { user: user, message, status });
  } catch (error) {
    next(error.message);
  }
};

// generate alphanumeric keys
function generateAlphanumericCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

// User signup complete controller
let otp;
exports.insertUser = async (req, res,next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;
    const refferal = req.body.refferal;
    req.session.referral=refferal

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const message = "Email already registered";
      return res.redirect(
        "/signup?status=success&message=" + encodeURIComponent(message)
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let code = generateAlphanumericCode(5);
    console.log(code)
    // Create new user
    const newUser = new User({
      fname,
      lname,
      email,
      password: hashedPassword,
      mobile,
      referral: code,
      wallet: 0,
    });
    // Save the new user to the DB
    await newUser.save();
    const verificationcode = generateOTP();
    otp = verificationcode;
    console.log(verificationcode)
    const user=""
    sendOtp(email, verificationcode);
    res.render("otpVerify",{email:email,refferal:refferal,message,status,user:user});
  } catch (error) {
   next(error.message);
  }
};

// resent otp for signup user
exports.resentOtp1 = async (req, res, next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const email = req.query.id;
    const refferal= req.session.refferal
    const verificationcode = generateOTP();
    const user = ""
    otp = verificationcode;
    sendOtp(email, verificationcode);
    res.render("otpVerify", { email: email, refferal: refferal, message, status, user: user });
  } catch (error) {
    next(error.message);
  }
};

// Login page controller
exports.loadLogin = async (req, res,next) => {
  try {
    // Get the status from the query parameters
    const status = req.query.status || "";
    const message = req.query.message || "";
    const blocked = req.query.blocked || "";
    const user= ""
    res.render("userLogin", {user:user, status, message, blocked });
  } catch (error) {
    next(error.message);
  }
};

// Login controller
exports.verifyLogin = async (req, res,next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const message = "No User Found";
      res.redirect(
        "/login?status=success&message=" + encodeURIComponent(message)
      );
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    // checking user password
    if (passwordMatch && !user.blocked && user.isVerified=== true) {
      req.session.user_id = user._id;
      const token = jwt.sign({ id: user._id }, process.env.jwtKey);
      req.session.token = token;
      res.redirect("/");
    } else {
      if (user.blocked == true) {
        const blocked = "You  are Blocked";
        res.redirect(
          "/login?status=success&message=" + encodeURIComponent(blocked)
        );
      } else {
        const message = "invalid email or password";
        res.redirect(
          "/login?status=success&message=" + encodeURIComponent(message)
        );
      }
    }
  } catch (error) {
    next(error.message);
  }
};

// Load user profile
exports.profile = async (req, res,next) => {
  try {
    const wish = req.session.wishlist
    const id = req.session.user_id;
    const user = await User.findOne({ _id: id });
    const user1 = await Address.findOne({ user: id });
    if (user1) {
      res.render("userprofile", { user: id, usrData: user, adrsData: user1,wish});
    } else {
      res.render("userprofile", { user: id, usrData: user, adrsData: null,wish});
    }
  } catch (error) {
    next(error.message);
  }
};

// Load user wallet info
exports.getWallet= async (req, res,next) => {
  try {
    const wish = req.session.wishlist
    const user = req.session.user_id;
    const userData = await User.findById(user);
    console.log(userData)
    const walletHistory = userData.walletHistory;
    console.log(walletHistory)
    res.render("wallet", { user, walletHistory,userData,wish});
  } catch (error) {
    next(error.message);
  }
};

//Load Edit user profile page
exports.editprofile = async (req, res,next) => {
  try {
    const wish = req.session.wishlist
    const id = req.session.user_id;
    const user = await User.findOne({ _id: id });
    res.render("editprofile", { user: id, usrData: user,wish});
  } catch (error) {
    next(error.message);
  }
};

// update user username and mobile number
exports.userupdate = async (req, res,next) => {
  try {
    const id = req.session.user_id;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const mobileString = req.body.mobile;
    const mobile = parseInt(mobileString, 10);
    await User.findOneAndUpdate(
      { _id: id },
      { $set: { fname: fname,lname:lname, mobile: mobile } }
    );
    const message = "udpated";
    res.redirect(
      "/editprofile?status=success&message=" + encodeURIComponent(message)
    );
  } catch (error) {
    next(error.message);
  }
};

//Load Edit password page
exports.editpass = async (req, res,next) => {
  try {
    const wish = req.session.wishlist
    const status = req.query.status || "";
    const message = req.query.message || "";
    const id = req.session.user_id;
    const user = await User.find({ _id: id });
    res.render("editpassword", { user: user, status, message,wish});
  } catch (error) {
    next(error.message);
  }
};

// update the current pass to new password
exports.passupdate = async (req, res,next) => {
  try {
    const { oldpass, confirmpass } = req.body;
    const id = req.session.user_id;
    const user = await User.findById({ _id: id });
    const passwordMatch = await bcrypt.compare(oldpass, user.password);
    if (passwordMatch) {
      const hashedPassword = await bcrypt.hash(confirmpass, 10);
      await User.updateOne({ _id: id }, { $set: { password: hashedPassword } });
      const message = "Password Updated Successfully";
      res.redirect(
        "/editpass?status=success&message=" + encodeURIComponent(message)
      );
    } else {
      const message = "Please try again";
      res.redirect(
        "/editpass?status=success&message=" + encodeURIComponent(message)
      );
    }
  } catch (error) {
    next(error.message);
    
  }
};

// forget password page
exports.forgetpass = async (req, res,next) => {
  try {
    let user=undefined
    res.render("forgetpass",{user});
  } catch (error) {
    next(error.message);
  }
};

// send forgetpass otp and render otp verify page
exports.sentOtp = async (req, res,next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const email = req.body.email;
    const verificationcode = generateOTP();
    otp = verificationcode;
    sendOtp(email, verificationcode);
    res.render("forgetVerify", { email: email,status, message,user});
  } catch (error) {
    next(error.message);
  }
};


// resent otp
exports.resentOtp = async (req, res,next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const email = req.query.id;
    const verificationcode = generateOTP();
    otp = verificationcode;
    sendOtp(email, verificationcode);
    res.render("forgetVerify", { email: email,status,message,user});
  } catch (error) {
   next(error.message);
  }
};

// verify forget pass otp
exports.resetpassOtp = async (req, res,next) => {
  try {
    const inputotp = req.body.inputotp;
    const email = req.body.email;
    if (inputotp == otp) {
      res.render("reeterPass", { email: email,user});
    } else {
      const message="wrong otp"
      res.redirect(
      "/resentOtp?status=success&message=" + encodeURIComponent(message)
    )
    }
  } catch (error) {
    next(error.message);
  }
};

// Enter and save new password
exports.newpass = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.confirm_password;

    // Find the user by email
    const user = await User.findOne({ email });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    const message = "Password updated successfully";
    res.redirect(
      "/login?status=success&message=" + encodeURIComponent(message)
    );
  } catch (error) {
   next(error.message);
  }
};

function generateOTP() {
  console.log("working");
  return Math.floor(100000 + Math.random() * 900000);
}

// Sending otp to mail
const sendOtp = (email, verificationcode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "baagystore@gmail.com",
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "baagystore@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${verificationcode}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// verify otp
exports.verifyOtp = async (req, res,next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const inputotp = req.body.userotp;
    const email = req.body.email;
    const referral = req.body.refferal;
    const reff = await User.findOne({ referral: referral });
    if (inputotp == otp && reff) {
      const check = await User.findOneAndUpdate(
        { email: email },
        {
          $set: { isVerified: true },
          $inc: { wallet: 200 },
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: 200,
              type: "Credit",
              balance: 200,
              details: "Referral",
            },
          },
        }
      );

      const oldUser = await User.findOneAndUpdate(
        { referral: referral },
        { $inc: { wallet: 400 } },
        { new: true }
      );
      
      const walletbal = oldUser.wallet;

      await User.findOneAndUpdate(
        { referral: referral },
        {
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: 400,
              type: "Credit",
              balance: walletbal, 
              details: "Referral",
            },
          },
        }
      );
      delete req.session.refferal
      res.redirect("/login");
    } else if (inputotp == otp) {
      const check = await User.findOneAndUpdate({ email: email },{$set: { isVerified: true }});
      res.redirect("/login");
    } else {
      const message = "Wrong OTP"; 
      res.render("otpVerify", { email: email, refferal: referral, message, status, user: user })
    }
  } catch (error) {
    next(error.message);
  }
};

exports.logout = (req, res,next) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    next(error.message);
  }
};

// load the shop page
exports.loadShop = async (req, res, next) => {
  try {
    const wish = req.session.wishlist
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const searchQuery = req.query.search;
    const category = req.query.category;
    const brand = req.query.brand;
    const selectedCategory = category || null;
    const selectedBrand = brand || null;
    const minPrice = parseInt(req.query.minPrice) || null;
    const maxPrice = parseInt(req.query.maxPrice) || null;
    const id = req.session.user_id;
    let search=''
    if(searchQuery !== undefined){
      search = searchQuery
    }

    let query = {};

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (minPrice !== null && maxPrice !== null && minPrice <= maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    const sortingValue = req.query.sort || "default"; // Provide a default sorting value
    
    const productCount = await Products.countDocuments(query);
    let prdts = await Products.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    

    if (sortingValue === "low") {
      prdts = prdts.sort((a, b) => a.price - b.price);
    } else if (sortingValue === "high") {
      prdts = prdts.sort((a, b) => b.price - a.price);
    }

    const cats = await Cat.find({ status: false });
    const allbrand = await Products.distinct("brand");
    const users= await User.find({_id:id})

    // Render the 'shop' view and pass the retrieved data
    res.render("shop", {
      user: users,
      catData: cats,
      selectedCategory,
      selectedBrand,
      allbrand,
      page,
      limit,
      productCount,
      prdData: prdts,
      cat: category,
      brand,
      minPrice,
      search,
      wish
    });
  } catch (error) {
    next(error.message);
  }
};


// show product
exports.showProduct = async (req, res, next) => {
  try {
    const wish = req.session.wishlist
    const session = req.session.user_id;
    const id = req.query.id;
      const user = await User.find({_id:session});
  
    const cart = await Cart.findOne({ user: session });

    let button = true; // Set the default value to true

    if (cart) {
      const foundProduct = cart.product.find((product) => product.productId.equals(id));

      if (foundProduct) {
        button = false; // Product found in the cart, set button to false
      }
    }

    const prdts = await Products.findOne({ _id: id, status: false });
    const prdts1 = await Products.find({
      _id: { $ne: id },
      status: false,
    }).limit(4);

    res.render("shopdetails", {
      prdData: prdts,
      user: user,
      prdData1: prdts1,
      cartbt: button,
      wish
    });
  } catch (error) {
    next(error.message);
  }
};


// Add products to the wishlist
exports.toWishlist = async (req, res,next) => {
  try {
    const user = req.session.user_id;
    const productId = req.query.id;

    if (!user) {
      res.redirect("/login");
      return;
    }else{
      await User.findByIdAndUpdate(user, {
        $addToSet: { wishlist: productId },
      });
      const update= await User.find({_id:user})
      delete req.session.wishlist
      req.session.wishlist= update[0].wishlist.length
      res.redirect(`/getproduct?id=${productId}`);
    }
  } catch (error) {
    next(error.message);
  }
};

// Remove products to the wishlist
exports.outWishlist = async (req, res,next) => {
  try {
    const user = req.session.user_id;
    let list = req.session.wishlist
    const val = (list-1)
    const Id = req.query.id;
    if (user){
     await User.findByIdAndUpdate(user, { $pull: { wishlist: Id } }); 
     req.session.wishlist=val
    res.redirect("/wishlist");
    }
  } catch (error) {
    next(error.message);
  }
};

// Load the wishlist page with products
exports.loadWishlist = async (req, res,next) => {
  try {
    const wish=req.session.wishlist
    const userId = req.session.user_id
    const userData = await User.findById(userId).populate("wishlist");
    const wishlistProducts = [];
    for (const productId of userData.wishlist) {
      const product = await Products.findById(productId);
      wishlistProducts.push(product);
    }
    res.render("wishlist", { user: userId, product: wishlistProducts,userData:userData,wish});
  } catch (error) {
    next(error.message);
  }
};

// payment success page
exports.success = async (req, res,next) => {
  try {
         const user = req.session.user_id
         const orders = await Order.find({ user })
         const userIn = await User.findOne({ _id: user })
         res.render("success", { orders, userIn });
  } catch (error) {
    next(error.message);
  }
};

// payment failed page
exports.failed = async (req, res,next) => {
  try {
       res.render("failed");
  } catch (error) {
   next(error.message);
  }
};

// load about page
exports.about = async (req, res, next) => {
  try {
    const id= req.session.user_id
    if(id){
      const user = await User.find({_id:id})
    }
    const wish = req.session.wishlist
    res.render("about",{wish,user});
  } catch (error) {
    next(error.message);
  }
};

// load contact us page
exports.contactus = async (req, res, next) => {
  try {
    const id= req.session.user_id
    const wish = req.session.wishlist
    if(id){
      var user= await User.find({_id:id})
    }
    const status = req.query.status || "";
    const message = req.query.message || "";
    res.render("contactus",{status,message,user,wish});
  } catch (error) {
    next(error.message);
  }
};

// submit contact form
exports.contactsubmit = async (req, res, next) => {
  try {
    const email= req.body.email
    const name= req.body.name
    const subject=req.body.subject
    const message=req.body.message
    sendmail(email,name,subject,message,res)

  } catch (error) {
    next(error.message);
  }
};

// Sending otp to mail
const sendmail = (email, name, subject, message, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'baagystore@gmail.com',
      pass: process.env.PASSWORD, // Ensure you have the correct environment variable set
    },
  });

  const mailOptions = {
    from: 'baagystore@gmail.com',
    to: 'baagystore@gmail.com', // Replace with the recipient's email address
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error sending email:', error);
      if (res) {
        res.redirect('/error'); // Redirect to an error page or handle the error appropriately
      }
    } else {
      console.log('Email sent:', info.response);
      if (res) {
        const message = "Thank You For Contacting Us"
        res.redirect(
          "/contact?status=success&message=" + encodeURIComponent(message)
        );
      }
    }
  });
};