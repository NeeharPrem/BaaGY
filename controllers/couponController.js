const coupon = require('../model/couponmodel');
const Coupon = coupon

const cart = require('../model/cartmodel');
const Cart = cart


exports.viewCoupons = async (req, res,next) => {
    const coupons=await Coupon.find({})
    res.render('adminCoupon',{coupons:coupons})
}

exports.addCouponspg = async (req, res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        next(error);
    }
}

exports.addCoupons = async (req, res,next) => {
    try {
        const { name, expiry, minAmt, description, discount, maxlimit } = req.body
        const coupon = new Coupon({
            name: name,
            description: description,
            expiry_date: expiry,
            discount: discount,
            min_amt: minAmt,
            maxdiscount:maxlimit,
            isActive:true     
        })
        const couponData = await coupon.save()
        if (couponData) {
            res.redirect('/admin/coupons')
        }
    } catch (error) {
        next(error);
    }
}

// Load the edit coupon page
exports.editCouponpg = async (req, res,next)=>{
    try {
        const couponId = req.query.id
        const coupon = await Coupon.findById(couponId)
        res.render('editCoupon',{coupon:coupon})
    } catch (error) {
        next(error);
    }
}

// push the update change to the db
exports.EditCoupons = async (req, res,next) => {
    try {
        const { name, expiry, minAmt, description, discount } = req.body
        const id = req.query.id
        if (id) {
            await Coupon.findByIdAndUpdate({ _id: id }, {
                $set: {
                    name: name,
                    description: description,
                    expiry_date: expiry,
                    discount: discount,
                    min_amt: minAmt,
            }})
        }
        res.redirect('/admin/coupons')
    } catch (error) {
        next(error);
    }
}

// unlist and list the coupons
exports.unlistCoupons=async(req,res,next)=>{
    try{
        const id = req.query.id;
        const coupon= await Coupon.findById({_id:id});
        if(coupon.isActive==true){
            await Coupon.updateOne({_id:id},{$set:{isActive:false}});
            res.redirect('/admin/coupons');
        }else{
            await Coupon.updateOne({_id:id},{$set:{isActive:true}});
             res.redirect('/admin/coupons');
        }
    }
    catch(error){
        next(error);
    }
}

// apply and verify coupon
exports.applyCoupon = async (req, res,next) => {
    try {
        const couponCode = req.body.coupon;
        const user = req.session.user_id;
        const couponStatus = await Coupon.findOne({ name: couponCode });
        if(couponStatus){
            const userArray= couponStatus.users
            if(userArray.includes(user)){
                const message = 'Already used coupon';
            return res.redirect('/loadcart?status=error&message=' + encodeURIComponent(message));
            } 
        }
        if (!couponStatus) {
            const message = 'Invalid coupon code';
            return res.redirect('/loadcart?status=error&message=' + encodeURIComponent(message));
        }
        const cart = await Cart.findOne({ user: user });
        if (!cart) {
            const message = 'Cart not found';
            return res.redirect('/loadcart?status=error&message=' + encodeURIComponent(message));
        }
        const currentDate = new Date();
        if (currentDate > couponStatus.expiry_date) {
            const message = 'Expired coupon';
            return res.redirect('/loadcart?status=error&message=' + encodeURIComponent(message));
        }
        if (cart.total < couponStatus.min_amt) {
            const message = 'Purchase amount is low';
            return res.redirect('/loadcart?status=error&message=' + encodeURIComponent(message));
        }
        await Cart.updateOne({ user: user }, { $set: { appliedcoupon: couponCode } });
        req.session.appliedcoupon = couponCode
        const message = 'Coupon applied';
        res.redirect('/loadcart?status=success&message=' + encodeURIComponent(message));
    } catch (error) {
        next(error);
    }
};

// remove the applied coupon
exports.removeCoupon = async (req, res,next) => {
    try {
        const user = req.session.user_id;
        const appliedCoupon = req.session.appliedcoupon
        
        // Find the user's cart
        const cart = await Cart.findOne({ user: user });

        if (!cart) {
            // Handle the case where the user's cart is not found
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the coupon applied to the cart
        const coupon = await Coupon.findOne({ name: appliedCoupon });

        if (!coupon) {
            // Handle the case where the coupon is not found
            return res.status(404).json({ message: "Coupon not found" });
        }
        // Remove the user from the coupon's users list
        await Coupon.updateOne({ name: appliedCoupon }, { $pull: { users: user } });

        const cartData = await Cart.findOne({ user: user }).populate("product.productId");

        if (!cartData) {
            return res.json("failed");
        }

        const productList = cartData.product.map(({ productId, count }) => ({
            productId,
            name: productId.name,
            price: productId.price,
            count,
        }));
    
        let total = productList.reduce((acc, item) => acc + item.price * item.count, 0);

        await Cart.updateOne({user:user},{$set:{total:total,appliedcoupon:''}})
        delete req.session.appliedcoupon;
        const message = 'Coupon Removed';
        res.redirect('/loadcart?status=success&message=' + encodeURIComponent(message));
        // return res.status(200).json({ message: "Coupon removed successfully", actualPrice });
    } catch (error) {
        next(error);
    }
};

