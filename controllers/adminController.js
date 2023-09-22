const bcrypt = require('bcrypt');
const admin = require('../model/adminmodel');
const Admin = admin
const product = require('../model/productmodel');
const Products=product
const users = require('../model/usermodel');
const Users=users
const orders = require("../model/ordermodel");
const Order = orders;
const category = require("../model/categorymodel");
const Cat = category;

//admin login page
exports.adminLoginPage = async (req,res,next)=>{
    try{
        const status = req.query.status || ''; 
        const message = req.query.message || '';
        res.render('adminlogin',{message,status})
    }
    catch(error){
       next(error.message);
    }
}

//admin login auhtentication
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      const message = 'Invalid admin email or password';
      return res.redirect('/admin?status=error&message=' + encodeURIComponent(message));
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (isPasswordValid && admin.isadmin === true) {
      req.session.admin_id = admin._id;
      return res.redirect('/admin/adminpanel');
    } else {
      const message = 'Invalid admin email or password';
      return res.redirect('/admin?status=error&message=' + encodeURIComponent(message));
    }
  } catch (error) {
    console.error(error.message);
  }
}


exports.adminPanel = async (req, res, next) => {
  try {
    
    if (req.query.year) {
      var year = req.query.year;
    } else {
      var year = "2023";
    }
    const yearData = await Order.aggregate([
      {
        $match: { orderStatus: "Delivered" },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$date" } },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
    const allYears = yearData.map((item) => item._id);
    let matchStage = { orderStatus: "Delivered" };

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const data = await Order.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const uniqueMonths = {};
    const totalAmounts = [];

    data.forEach((item) => {
      const date = new Date(item._id);
      const monthName = date.toLocaleString("en-US", { month: "long" });

      if (!uniqueMonths[monthName]) {
        uniqueMonths[monthName] = item.totalAmount;
      } else {
        uniqueMonths[monthName] += item.totalAmount;
      }
    });

    for (const month in uniqueMonths) {
      totalAmounts.push(uniqueMonths[month]);
    }

    const uniqueMonthsArray = Object.keys(uniqueMonths);

    //for pie chart
    const paymentData = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },

      {
        $group: { _id: "$paymentMode", count: { $sum: 1 } },
      },
    ]);
    const paymentModeArray = paymentData.map((item) => item._id);

    const paymentCountArray = paymentData.map((item) => item.count);

    //for category chart
    const aggregatedOrder = await Order.aggregate([
      {
        $unwind: "$products",
      },
      { $match: { orderStatus: "Delivered" } },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productDetails.category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const objectIdsArray = aggregatedOrder.map((order) => order._id);
    const catCountArray = aggregatedOrder.map((order) => order.count);

    const categoriesArray = await Cat.find(
      { _id: { $in: objectIdsArray } },
      "name"
    );
    const namesArray = categoriesArray.map((category) => category.name);

    //for user number

    const userCount = await Users.countDocuments({});

    //revenue generated
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const yearDataa = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
          date: {
            $gte: new Date(currentYear, currentMonth, 1), // Start of the current month
            $lt: new Date(currentYear, currentMonth + 1, 1), // Start of the next month
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalSales: { $sum: "$total" }, // Assuming the sales total is stored in the "total" field
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const totalSalesForCurrentMonth =
      yearDataa.length > 0 ? yearDataa[0].totalSales : 0;

    //order pending
    const ordersPending = await Order.aggregate([
      {
        $match: {
          orderStatus: "Confirmed",
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // The count of pending orders will be available in the 'ordersPending' array
    const countPendingOrders =
      ordersPending.length > 0 ? ordersPending[0].count : 0;

    //the sales report

    let fromdate = req.query.fromDate;
    let todate = req.query.toDate;

    if (fromdate && todate) {
      fromdate = new Date(fromdate);
      todate = new Date(todate);
      todate = new Date(todate.getTime() + 1 * 24 * 60 * 60 * 1000);

      var order = await Order.find({
        orderStatus: "Delivered",
        date: { $gte: fromdate, $lte: todate },
      })
        .populate("user")
        .populate("products.productId");
    } else {
      var order = await Order.find({ orderStatus: "Delivered" })
        .populate("user")
        .populate("products.productId");
    }

    const currDate = new Date();

    res.render("admin", {
      uniqueMonthsArray,
      totalAmounts,
      allYears,
      year,
      paymentModeArray,
      paymentCountArray,
      namesArray,
      catCountArray,
      userCount,
      totalSalesForCurrentMonth,
      order,
      countPendingOrders,
      currDate,
    });
  } catch (error) {
    next(error.message);
  }
};

exports.products=async (req,res,next)=>{
  try {
    const product=await Products.find({})
    res.status(200).json(product)
  } catch (error) {
    next(error.message);
  }
}

exports.userManage=async (req,res,next)=>{
    try{
        const userData = await Users.find({});
        res.render('adminuser',{user:userData})
    }
    catch(error){
        next(error.message);
    }
  }

exports.blockUser=async(req,res)=>{
    try{
        const id = req.query.id;
        const user= await Users.findById({_id:id});
        if(user.blocked==false){
            await Users.updateOne({_id:id},{$set:{blocked:true}});
            res.redirect('/admin/userdash');
        }else{
            await Users.updateOne({_id:id},{$set:{blocked:false}});
             res.redirect('/admin/userdash');
        }
    }
    catch(error){
        next(error.message);
    }
}

//admin logout
exports.adminLogout = (req,res) => {
    try{
        req.session.destroy()
        res.redirect('/admin')
    }
    catch(error){
        console.log(error.message);
    }
}