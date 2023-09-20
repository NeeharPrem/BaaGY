const cart = require('../model/cartmodel');
const Cart = cart
const product = require('../model/productmodel');
const Products=product
const coupons= require('../model/couponmodel');
const Coupon=coupons
const user = require("../model/usermodel");
const User=user


// Load the shoping cart page
exports.loadCart = async (req, res,next) => {
    try {
        const wish = req.session.wishlist
        const status = req.query.status || '';
        const message = req.query.message || '';
        const user = req.session.user_id;
        
        const userData= await User.find({_id:user})
        let cart = await Cart.findOne({ user: user }).populate('product.productId');
        const availableCoupons = await Coupon.find({ users: { $ne: user } })
        const productTotal = cart.product.reduce((acc, curr) => acc + curr.subtotal, 0);
        await Cart.findOneAndUpdate({ user: user }, { $set: { total: productTotal } }).populate('product.productId');
        await Cart.findOneAndUpdate({ user: user }, { $set: { appliedcoupon: '' ,discount:0,subtotal:0} });
        cart = await Cart.findOne({ user: user }).populate('product.productId');
        // const cart2 = await Cart.fidOne({ user: user }).populate('product.productId');
        res.render('shopingcart', { cart, coupons: availableCoupons, usedcpn: null, cart1: null, status, message, user: userData, wish });
    } catch (error) {
        next(error.message);
    }
};

exports.addtoCart = async (req, res,next) => {
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
        next(error.message);
    }
};


// update cart items
exports.updateCart = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const quantity = parseInt(req.body.amt);
        const prodId = req.body.productId;
        const product = await Products.findOne({ _id: prodId });
        const stock = product.quantity;
        const price = quantity * product.price;
        const singleprice=product.price

        if (stock >= quantity) {
            // Update the cart item's quantity and subtotal
            await Cart.updateOne(
                { user: user, 'product.productId': prodId },
                { $set: { 'product.$.count': quantity, 'product.$.subtotal': price } }
            );

            // Fetch the updated cart data
            let cartData = await Cart.find({ user: user }).populate('product.productId');

            // const appliedCoupon = req.session.appliedcoupon;
            const cartTotal = cartData[0].total;
            const discount = cartData[0].discount
            
            if(!discount){
                let [{ product }] = cartData;
                let productTotal = product.reduce((acc, curr) => acc += curr.subtotal, 0);
                let newTotal = productTotal

                await Cart.updateOne({ user: user }, { $set: { total: newTotal } });

                return res.json({ status: true, loadcart: false, data: { st: 'worked', price, Total: newTotal } });
            }else{
                let [{ product }] = cartData;
                let productTotal = product.reduce((acc, curr) => acc += curr.subtotal, 0);
                let newTotal = productTotal - discount

                await Cart.updateOne({ user: user }, { $set: { total: newTotal } });

                return res.json({ status: true, loadcart: false, data: { st: 'worked', price, Total: newTotal } });
            }
        
        } else {
            console.log("3")
            return res.json({ status: false, data: 'Out of stock' });
        }
    } catch (error) {
        next(error.message);
    }
};


exports.deleteItem = async (req, res,next) => {
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
      next(error.message);
  }
};

