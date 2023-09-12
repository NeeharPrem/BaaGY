const cart = require('../model/cartmodel');
const Cart = cart
const product = require('../model/productmodel');
const Products=product
const coupons= require('../model/couponmodel');
const Coupon=coupons
const User = require("../model/usermodel");


// Load the shoping cart page
exports.loadCart = async (req, res) => {
    try {
        const status = req.query.status || '';
        const message = req.query.message || '';
        const user = req.session.user_id;

        let cart = await Cart.findOne({ user: user }).populate('product.productId');
        const availableCoupons = await Coupon.find({ users: { $ne: user } })
        if (cart) {
            const appliedCoupon = cart.appliedcoupon;
            const carttotal = cart.total;

            if (appliedCoupon) {
                const coupon = await Coupon.findOne({ name: appliedCoupon });
                const maxAmount = coupon.maxdiscount
                if (coupon && carttotal >= coupon.min_amt) {
                    const productTotal = cart.product.reduce((acc, curr) => acc + curr.subtotal, 0);
                    if (carttotal === productTotal) {
                        const discount = carttotal * (coupon.discount / 100);
                        const newTotal = carttotal - discount;
                        if(newTotal >= maxAmount){
                            payamount= carttotal- maxAmount
                        }else{
                            payamount= newTotal
                        }
                        await Cart.findOneAndUpdate({ user: user }, { $set: { total: payamount,appliedcoupon:''} });
                        const cart1 = await Cart.findOne({ user: user }).populate('product.productId'); // Update cart after discount application
                        console.log("1")
                        res.render('shopingcart', { cart, coupons: availableCoupons, usedcpn: coupon, cart1: cart1, status, message });
                    } else{
                        console.log("2")
                        res.render('shopingcart', { cart, coupons: availableCoupons, usedcpn: coupon, cart1: null, status, message });
                    }
                } else {
                    console.log("3")
                    res.render('shopingcart', { cart, coupons: availableCoupons, usedcpn: null, cart1: null, status, message });
                }
            } else {
                console.log("4")
                const productTotal = cart.product.reduce((acc, curr) => acc + curr.subtotal, 0);
                await Cart.findOneAndUpdate({ user: user }, { $set: { total: productTotal } }).populate('product.productId');
                cart = await Cart.findOne({ user: user }).populate('product.productId');
                // const cart2 = await Cart.fidOne({ user: user }).populate('product.productId');
                res.render('shopingcart', { cart, coupons: availableCoupons, usedcpn: null, cart1: null, status, message });
            }
        } else {
            console.log("5")
            res.render('shopingcart', { cart: null, status, message });
        }
    } catch (error) {
        console.log("Error:", error); // Log the actual error for debugging
        res.status(500).send('Internal Server Error'); // Handle errors gracefully
    }
};

exports.addtoCart = async (req, res) => {
    try {
        const user = req.session.user_id;
        const product = req.body.productId;
        const products = await Products.findOne({ _id: product });
        const price = products.price;
        const count = 1;
        const cart = await Cart.findOne({ user: user });
        
        if (!cart) {
            const newItem = new Cart({
                user,
                product: [{
                    productId: product,
                    count: count,
                    subtotal: price * count
                }],
                total: price * count,
                appliedcoupon: "",
            });
            
            await newItem.save();
            res.redirect('/loadcart');
        } else {
            await Cart.updateOne({ user },
                {
                    $addToSet: { product: { productId: product, count: count, subtotal: price * count } },
                }
            );
                res.redirect('/loadcart')
                }
    } catch (error) {
        console.log(error);
    }
};


// update cart items
exports.updateCart = async (req, res) => {
    try {
        const user = req.session.user_id;
        const quantity = parseInt(req.body.amt);
        const prodId = req.body.productId;
        const product = await Products.findOne({ _id: prodId });
        const stock = product.quantity;
        const price = quantity * product.price;
        
        if (stock >= quantity) {
            await Cart.updateOne(
                { user: user, 'product.productId': prodId },
                { $set: { 'product.$.count': quantity, 'product.$.subtotal': price }}
            );
            
            let cartData = await Cart.find({ user: user }).populate('product.productId');
            const appliedcoupon = req.session.appliedcoupon
            const cartTotal = cartData[0].total
            
            let [{ product }] = cartData;
            let productTotal = product.reduce((acc, curr) => acc += curr.subtotal, 0);

            if (appliedcoupon && cartTotal === productTotal) {
                const coupon = await Coupon.findOne({ name: appliedcoupon });
                const maxAmount= coupon.maxdiscount
                if (coupon && productTotal > coupon.min_amt) {
                    const discount = productTotal * (coupon.discount / 100);
                    const newTotal = productTotal - discount;
                    if (newTotal >= maxAmount) {
                        payamount = productTotal - maxAmount
                    } else {
                        payamount = newTotal
                    }

                    await Cart.updateOne({ user: user }, { $set: { total:payamount } });
                    return res.json({ status: true, data: { st: 'worked', price, Total: newTotal } });
                } else {
                    return res.json({ status: false, data: 'Coupon not applicable' });
                }
            } else if (appliedcoupon && cartTotal !== productTotal) {
                const coupon = await Coupon.findOne({ name: appliedcoupon });

                if (coupon && productTotal > coupon.min_amt) {
                    const discount = productTotal * (coupon.discount / 100);
                    const newTotal = productTotal - discount;
                    if (newTotal >= maxAmount) {
                        payamount = productTotal - maxAmount
                    } else {
                        payamount = newTotal
                    }

                    await Cart.updateOne({ user: user }, { $set: { total: payamount } });
                    return res.json({ status: true, data: { st: 'worked', price, Total: newTotal } });
                } else {
                    return res.json({ status: false, data: 'Coupon not applicable' });
                }
            } else if (cartTotal !== productTotal) {

                await Cart.updateOne({ user: user }, { $set: { total: productTotal } });
                res.json({ status: true, data: { st: 'worked', price, Total:productTotal } });
            } else {
                let [{ product }] = cartData;
                let Total = product.reduce((acc, curr) => acc += curr.subtotal, 0);
                
                await Cart.updateOne({ user: user }, { $set: { total: Total } });
                res.json({ status: true, data: { st: 'worked', price, Total } });
            }
        } else {
            res.json({ status: false, data: 'out of stock' });
        }
    } catch(error) {
        console.log(error);
        res.json({ status: false, data: 'An error occurred' });
    }
};

exports.deleteItem = async (req, res) => {
  try {
      const user = req.session.user_id;
      const productId = req.query.productId;
      
      if (productId) {
          // Remove the product from the cart
          await Cart.updateOne(
              { user: user },
              { $pull: { product: { productId: productId } } }
          );

          // Fetch updated cart data
          let cartData = await Cart.findOne({ user: user }).populate('product.productId');
          
          if (cartData.product.length>=1) {
              let { product } = cartData;
              let Total = product.reduce((acc, curr) => acc + curr.subtotal, 0);
              
              // Update cart totals
              await Cart.updateOne(
                  { user: user },
                  { $set: { total: Total, subtotal: Total } }
              );
              
              res.redirect('/loadcart');
          } else {
              // If cart is empty, reset coupons and redirect
              await Cart.updateOne(
                { user: user },
                { $set: { product: [], total: 0 , appliedcoupon: "" } }
            );
              
              res.redirect('/loadcart');
          }
      }
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred");
  }
};

