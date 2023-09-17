const cart = require('../model/cartmodel');
const Cart = cart
const address = require('../model/addressmodel');
const Address=address
const product = require('../model/productmodel');
const Products=product
const user = require('../model/usermodel');
const Users=user
const orders= require('../model/ordermodel');
const Order=orders
const coupons= require('../model/couponmodel');
const Coupon=coupons
const Razorpay = require('razorpay');
const easyinvoice=require('easyinvoice')
const fs = require('fs');
// const { log } = require('console');

// razor pay instance
var instance = new Razorpay({
    key_id: "rzp_test_qnxvdHZX8CBOiS",
    key_secret: "jCpGjMIgmGDMith9hYaPLNF8",
  });

// Load order managment page of user
exports.loadOrders=async(req,res,next)=>{
   try {
      const user=req.session.user_id
      const orders = await Order.find({ user:user}).populate("products.productId")
       res.render('userorders',{user:user,Order:orders})
   } catch (error) {
    next(error);
   }
}

// show detail page the order
exports.orderDetails = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const orderId = req.query.id;
   
        const orders = await Order.find({ _id: orderId }).populate('products.productId');

        const orderDate = new Date(orders[0].date);
        const day1= orderDate.getDate();

        const date = new Date();
        const day2= date.getDate();

        // date difference  to disable return date
        const rdate = Math.abs(day2 - day1);

        if (orders.length === 0) {
            return res.status(404).send('Order not found');
        }

        const addressId = orders[0].address.toString();
        const address = await Address.findOne({ user: user });

        if (!address) {
            return res.status(404).send('Address not found');
        }
        const addressObject = address.address.find(
            (address) => address._id.toString() === addressId
        );
        res.render('orderDetails', { user: user, orders: orders,rdate, addrs: addressObject});
    } catch (error) {
        next(error);
    }
};


// Load checkout page
exports.loadCheckout = async (req, res,next) => {
    try {
      const id = req.session.user_id;
      const userData= await Users.find({_id:id})
      const address = await Address.findOne({ user: id});
      const carts = await Cart.findOne({ user:id }).populate('product.productId');
        if(cart){
            const productList = carts.product.map(({ productId, count }) => ({
                productId,
                name: productId.name,
                price: productId.price,
                count,
            }));

            let total = productList.reduce((acc, item) => acc + item.price * item.count, 0);
            if (total != carts.total) {
                const discount = total - carts.total
                res.render('checkout', { cart: carts, address: address, user: userData, discount });
            } else {
                const discount = undefined
                res.render('checkout', { cart: carts, address: address, user: userData, discount });
            }
        }else{
            res.redirect('/')
        }
    
    } catch (error) {
        next(error.message);
    }
  };
  
  

 // place the order
 exports.placeOrder = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const addId = req.body.addressId[0];
        const wallet=req.body.wallet
        req.session.addId = addId;
        req.session.wallet= wallet
        const paymentMethod = req.body.paymentMethod;

        const address = await Address.findOne({ user: user, "address._id": addId });
        const addressObject = address.address.find(addr => addr._id.toString() === addId)
        const cartData = await Cart.findOne({ user: user }).populate("product.productId");
        const userData= await Users.findOne({_id:user})
        const walletBalance= userData.wallet

        if (!cartData) {
            return res.json("failed");
        }
        const status = "Confirmed";
        const productList = cartData.product.map(({ productId, count }) => ({
            productId,
            name: productId.name,
            price: productId.price,
            count,
            orderStatus: status,
        }));
    
        let total = productList.reduce((acc, item) => acc + item.price * item.count, 0);
        const carttotal= cartData.total
        var payamount= carttotal
        const coupons = req.session.appliedcoupon

        if (coupons && carttotal !== total) {
            const coupon = await Coupon.findOne({ name: coupons });
            var discount=0
            const maxAmount = coupon.maxdiscount
            discount = total * (coupon.discount / 100);
            req.session.discount= discount
            const newTotal = total - discount;
            if (newTotal >= maxAmount) {
                req.session.discount = maxAmount
                 payamount = total - maxAmount
            } else {
                payamount = newTotal
            }

        }

        if (paymentMethod === 'COD') {
            const date = new Date();
            const discount = req.session.discount
    
            const newOrder = new Order({
                user: user,
                date: date,
                products: productList,
                orderStatus: status,
                paymentMode: paymentMethod,
                address: addressObject,
                total: payamount,
                coupon:coupons,
                discount:discount,
            });
    
            await newOrder.save();
    
            for (const { productId, count } of productList) {
                await Products.updateOne(
                    { _id: productId._id },
                    { $inc: { quantity: -count } }
                );
            }
    
            await Cart.updateOne(
                { user: user },
                { $set: { product: [], total: 0, appliedcoupon: "" } }
            );

            const couponCode=cartData.appliedcoupon
            await Coupon.updateOne({ name: couponCode },{ $push: { users: user } } );
            
            return res.json({ status: paymentMethod });
    
        } else if (paymentMethod === 'Razorpay') {
            if(wallet){
                console.log("with v",payamount)
                // console.log('Payment method razorpay');
                const newTotal = payamount - walletBalance
                const options = {
                    amount: Math.round(newTotal * 100),
                    currency: 'INR',
                    receipt: "hello"
                };

                // Call the Razorpay API to create an order
                const order = await instance.orders.create(options);

                // console.log('Sent json status razorpay');
                // console.log(order);
                res.json({ status: 'Razorpay', order: order })
            }else{
                console.log("no v",payamount)
                const options = {
                    amount: Math.round(payamount * 100),
                    currency: 'INR',
                    receipt: "hello"
                };

                // Call the Razorpay API to create an order
                const order = await instance.orders.create(options);

                // console.log('Sent json status razorpay');
                // console.log(order);
                res.json({ status: 'Razorpay', order: order })
            }
        }else if (paymentMethod === 'wallet'){
            let discount = req.session.discount
            const userData = await Users.findOne({_id:user})
            const walletBalance= userData.wallet
            const newBalance= Math.abs(walletBalance-payamount)
            // const status = "Confirmed";
            const date = new Date();

            const newOrder = new Order({
                user: user,
                date: date,
                products: productList,
                orderStatus: status,
                paymentMode: paymentMethod,
                address: addressObject,
                total: payamount,
                coupon: coupons,
                discount: discount,
            });

            await newOrder.save();

            for (const { productId, count } of productList) {
                await Products.updateOne(
                    { _id: productId._id },
                    { $inc: { quantity: -count } }
                );
            }

            await Cart.updateOne(
                { user: user },
                { $set: { product: [], total: 0, appliedcoupon: "" } }
            );

            const couponCode = req.session.appliedcoupon
            await Coupon.updateOne({ name: couponCode }, { $push: { users: user } });

            await Users.findOneAndUpdate(
                {_id:user},
                {
                    $set: { wallet: newBalance},
                    $push: {
                        walletHistory: {
                            date: Date.now(),
                            amount: total,
                            type: "Debit",
                            balance: newBalance,
                            details: "Purchase",
                        },
                    },
                }
            );
            return res.json({ status: paymentMethod });
        } else {
            res.json("failed");
        }
            } catch (error) {
                next(error);
            }
         }

 exports.verifyPayment = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const addId= req.session.addId;
        const wallet = req.session.wallet
        // console.log(req.session)
        const details = req.body;
        const keys = Object.keys(details)
 
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
        hmac.update(details.response.razorpay_order_id + '|' + details.response.razorpay_payment_id);
        hmac = hmac.digest('hex');
 
        if (hmac === details.response.razorpay_signature) {
            const status = 'Confirmed';
             
            // Fetching user's cart data
            const coupon= req.session.appliedcoupon
            const discount= req.session.discount
            const cartData = await Cart.findOne({ user: user }).populate("product.productId");
            const productList = cartData.product.map(
                ({ productId, count }) => ({
                    productId,
                    name: productId.name,
                    price: productId.price,
                    count,
                    orderStatus: status,
                })
            );

            // Fetching user's selected address
            const address = await Address.findOne({ user: user, "address._id": addId });
            const addressObject = address.address.find(
                (address) => address._id.toString() === addId
            );
            
            
            const carttotal = cartData.total;
        //     const coupons = req.session.appliedcoupon
           let total = productList.reduce((acc, item) => acc + item.price * item.count, 0);
            let payamount=carttotal
            
            if (wallet) {
                const userData = await Users.findOne({ _id: user })
                const walletBalance = userData.wallet
                const newTotal = payamount - walletBalance

                const date = new Date();

                // Creating a new order
                const newOrder = new Order({
                    user: user,
                    date: date,
                    products: productList,
                    orderStatus: status,
                    paymentMode: 'Razorpay',
                    address: addressObject,
                    total: newTotal,
                    coupon: coupon,
                    discount: discount,
                });
                await newOrder.save();

                // Reducing quantity/stock of purchased products from Products Collection
                for (const { productId, count } of productList) {
                    await Products.updateOne(
                        { _id: productId._id },
                        { $inc: { quantity: -count } }
                    );
                }

                // Deleting Cart from user collection
                await Cart.updateOne(
                    { user: user },
                    { $set: { product: [], total: 0, appliedcoupon: "" } }
                );


                const couponCode = req.session.appliedcoupon
                await Coupon.updateOne({ name: couponCode }, { $push: { users: user } });

                await Users.findOneAndUpdate(
                    { _id: user },
                    {
                        $set: { wallet:0 },
                        $push: {
                            walletHistory: {
                                date: Date.now(),
                                amount: total,
                                type: "Debit",
                                balance: 0,
                                details: "Purchase",
                            },
                        },
                    }
                );

                res.json({ status: true });
            }else{
                const date = new Date();
                const status = 'Confirmed';

                // Creating a new order
                const newOrder = new Order({
                    user: user,
                    date: date,
                    products: productList,
                    orderStatus: status,
                    paymentMode: 'Razorpay',
                    address: addressObject,
                    total: payamount,
                    coupon: coupon,
                    discount: discount,
                });
                await newOrder.save();

                // Reducing quantity/stock of purchased products from Products Collection
                for (const { productId, count } of productList) {
                    await Products.updateOne(
                        { _id: productId._id },
                        { $inc: { quantity: -count } }
                    );
                }

                // Deleting Cart from user collection
                await Cart.updateOne(
                    { user: user },
                    { $set: { product: [], total: 0, appliedcoupon: "" } }
                );


                const couponCode = req.session.appliedcoupon
                await Coupon.updateOne({ name: couponCode }, { $push: { users: user } });

                res.json({ status: true });
            }
        } else {
            // Payment verification failed
            res.json({ status: false });
        }
    } catch (error) {
        next(error);
    }
};

// cancel order by user
exports.cancelOrder = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const id = req.query.id;
        await Order.updateOne({ _id: id }, { $set: { orderStatus: 'Cancelled' } });
        const order = await Order.findOne({_id:id})

        for (const product of order.products) {
                product.orderStatus = 'Cancelled';
            }

        // // Save the updated order with the cancelled product statuses
        await order.save();
        const payType= order.paymentMode
        if(payType == 'Razorpay' || payType== 'wallet'){
            const incrementValue = order.total;
            await Users.updateOne(
              { _id: user },
              { $inc: { wallet: incrementValue } }
            );
            res.redirect(`/viewDetails?id=${id}`);
        }else{
            res.redirect(`/viewDetails?id=${id}`);
        }
    } catch (error) {
        next(error);
    }
};

// cancel individual product from the order
exports.cancelProduct = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const id = req.body.id
        const pid= req.body.pid
        
        // await Order.updateOne({ _id: id }, { $set: { orderStatus: 'Cancelled' } });
        const order = await Order.findOne({ _id: id })
        const product= await Products.findOne({_id:pid})
        const discount = order.discount
        console.log(order.products.length)
        const total=order.total
  
        const productprice=product.price

        const couponname =order.coupon

        const coupon= await Coupon.findOne({name:couponname})
     
        const cpnprice=coupon.min_amt
        for (const product of order.products) {
           
            if (product.productId._id == pid) {
                product.orderStatus = 'Cancelled';
            }
        }
        // // Save the updated order with the cancelled product statuses
        await order.save();

        if ((total + discount - productprice) <cpnprice){
            console.log('1');
                var refund= productprice -  discount/order.products.length
            const payType = order.paymentMode
            if (payType == 'Razorpay'|| payType=="wallet") {
                await Users.updateOne(
                    { _id: user },
                    { $inc: { wallet: refund } }
                );
                res.redirect(`/viewDetails?id=${id}`);
        }else{
                res.redirect(`/viewDetails?id=${id}`);
        }
    }
    } catch (error) {
        next(error);
    }
};

// Return order by user
exports.returnOrder = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const id = req.query.id;
        if (user) {
            await Order.updateOne({ _id: id }, { $set: { returnStatus: true} });
        }
        res.redirect(`/viewDetails?id=${id}`);
    } catch (error) {
        next(error);
    }
};

// Return order by user
exports.returnProduct = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const id = req.body.id
        const pid= req.body.pid
        if (user) {
            const order = await Order.findOne({ _id: id })
            for (const product of order.products) {
                if (product.productId._id == pid) {
                    product.returnStatus = true
                }
            }

            // // Save the updated order with the cancelled product statuses
            await order.save();
            // await Order.updateOne({ _id: id }, { $set: { returnStatus: true } });
        }
        res.redirect(`/viewDetails?id=${id}`);
    } catch (error) {
        next(error);
    }
};


// admin order Listing //
exports.orderList=async(req,res,next)=>{
    try {
        const orders = await Order.find({}).populate("products.productId");
        const userIds = orders.map((order) => order.user);
        const users = await Users.find({ _id: { $in: userIds } });

        const ordersWithUser = orders.map((order) => {
            const user = users.find(
              (user) => user._id.toString() === order.user.toString()
            );
            return { ...order._doc, user };
          });
        res.render('adminOrders',{orders: ordersWithUser})
    } catch (error) {
        next(error);
    }
 }

//  Order detail page for admin
exports.orderDetails2 = async (req, res,next) => {
    try {
        const orderId = req.query.id;
        const orders = await Order.find({ _id: orderId }).populate('products.productId');
        if (orders.length === 0) {
            return res.status(404).send('Order not found');
        }
        const addressId = orders[0].address.toString();
        const user = orders[0].user.toString();
        const address = await Address.findOne({user:user,"address._id":addressId});

        const addressObject = address.address.find(
            (address) => address._id.toString() === addressId
        );

        if (!address) {
            return res.status(404).send('Address not found');
        }
        res.render('orderderdetails', {orders: orders, addrs: addressObject });
    } catch (error) {
        next(error);
    }
};

// Admin update the order status
exports.updateStatus= async (req, res,next) => {
    try {
        const orderId=req.body.id
        const status=req.body.orderStatus
        const order = await Order.findOne({ _id: orderId });
        for (const product of order.products) {
                product.orderStatus = status;
        }

        // // Save the updated order with the cancelled product statuses
        await order.save();
       await Order.updateOne({ _id:orderId}, { $set: { orderStatus:status} });
       if (status === 'Return') {
        const userId = order.user;
        const incrementValue = order.total;
        let user=await Users.findOne({ _id: userId});
        const walletBalance=user.wallet
           
        await Users.findOneAndUpdate(
               { _id: userId }, { $inc: { wallet: incrementValue } },
               {
                   $push: {
                       walletHistory: {
                           date: Date.now(),
                           amount: incrementValue,
                           type: "Credit",
                           balance: walletBalance,
                           details: "Refund amount",
                       },
                   },
               }
           );
    }
        res.redirect(`/admin/orderDetails?id=${orderId}`);
    } catch (error) {
        next(error);
    }
};

// Return product approve by admin
exports.approveReturn = async (req, res, next) => {
    try {
        console.log(req.body)
        const id = req.body.id
        const pid = req.body.pid
            const order = await Order.findOne({ _id: id })
            for (const product of order.products) {
                if (product._id == pid) {
                    product.orderStatus = "Return"
                }
            }
            // // Save the updated order with the cancelled product statuses
            await order.save();
            // await Order.updateOne({ _id: id }, { $set: { returnStatus: true } });
        res.redirect(`/admin/orderDetails?id=${id}`);
    } catch (error) {
        next(error);
    }
};


// download invoice
exports.downloadInvoice = async (req, res,next) => {
    try {
        
        const user= req.session.user_id
        const orderId = req.query.id;
        const order = await Order.findOne({ _id: orderId }).populate('products.productId');
        const addId = order.address.toString();
        const address = await Address.findOne({user:user,"address._id":addId});
        const addressObject = address.address.find(
            (address) => address._id.toString() === addId
        );

        const productArray = order.paymentMode
      
        var data = {
          "customize": {
            //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
          },
          "images": {
            // The logo on top of your invoice
            "logo": "https://i.ibb.co/jV27TRB/svgexport-8.png",
            // The invoice background
            // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
          },
          // Your own data
          "sender": {
            "company": "Baagy",
            "address": "Kannur, Kerala",
            "zip": "123456",
            "city": "Kannur",
            "country": "India"
          },
          // Your recipient
          "client": {
            "company": addressObject.name,
            "address": addressObject.address,
            "zip": addressObject.pincode,
            "city":addressObject.locality,
            "country": addressObject.state
          },
          "information": {
            // Invoice number
            "Invoice number": orderId,
            // Invoice data
            "date": order.date,
            // Invoice due date
            // "due-date": "31-12-2021"
          },
        "products": 
        order.products.map(product => ({
            "quantity": product.count,
            "description": product.productId.name,
            "tax-rate": 18, // You can add tax rate here if you have it in the database
            "price": (product.productId.price)/1.18
          })),             
          "payment": {
              "method": productArray  // Assuming you have a paymentMode field in your Order model
          },
          // "bottom-notice": "Kindly pay your invoice within 15 days.",
          "footer": {
            "text": "Thank you for your business!"
          },
          "settings": {
            "currency": "INR" // Change to the appropriate currency based on your order data
          },
          // Translate your invoice to your preferred language
          "translate": {
            // "invoice": "FACTUUR",  // Default to 'INVOICE'
            // "number": "Nummer", // Defaults to 'Number'
            // "date": "Datum", // Default to 'Date'
            // "due-date": "Verloopdatum", // Defaults to 'Due Date'
            // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
            // "products": "Producten", // Defaults to 'Products'
            // "quantity": "Aantal", // Default to 'Quantity'
            // "price": "Prijs", // Defaults to 'Price'
            // "product-total": "Totaal", // Defaults to 'Total'
            // "total": "Totaal", // Defaults to 'Total'
            "gst": "GST"
          },
        }
      
    const result = await easyinvoice.createInvoice(data);
    res.set('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.set('Content-Type', 'application/pdf');
    res.send(Buffer.from(result.pdf, 'base64'));
  
} catch (error) {
    next(error);
}
}




