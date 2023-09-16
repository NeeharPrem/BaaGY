const address = require('../model/addressmodel');
const Address = address
const user = require('../model/usermodel');
const User = user


// Load address page
exports.loadAddress = async (req, res,next) => {
    try {
        const status = req.query.status || ''; 
        const message = req.query.message || '';
        const id=req.session.user_id
        const user = await User.find({ _id: id })
        const address= await Address.findOne({user:id})
        if(address){
            res.render('useraddress',{user:user,address:address,status,message})
        }else{
            res.render('useraddress',{user:user,address:null,status,message})
        }
    }
    catch (error) {
       next(error.message);
    }
}

// Load add address form profile
exports.loadForm = async (req, res,next) => {
    try {
        const status = req.query.status || ''; 
        const message = req.query.message || '';
        const id=req.session.user_id
        const user= await User.find({_id:id})
        res.render('addaddress',{user:user,status,message})
    }
    catch (error) {
       next(error.message);
    }
}

// Load add address form from checkout page
exports.loadForms = async (req, res,next) => {
    try {
        const status = req.query.status || ''; 
        const message = req.query.message || '';
        const id=req.session.user_id
        const user= await User.find({_id:id})
        res.render('addresscout',{user:user,status,message})
    }
    catch (error) {
        next(error.message);
    }
}

// Insert user address in to db
exports.adddata = async (req, res,next) => {
    try {
        const user=req.session.user_id
        const {name,mobile,address,locality,pincode,district,state}=req.body
        const exisisting= await Address.findOne({user:user})
        if(!exisisting){
            const newAddress= new Address({
                user,
                address:[{name,mobile,address,locality,pincode,district,state}]
            })
            await newAddress.save()
            res.redirect('/address')
        }else{
            await Address.findOneAndUpdate({user:user},{$push:{address:[{name,mobile,address,locality,pincode,district,state}]}})
            res.redirect('/address')
        }
    }
    catch (error) {
        next(error.message);
    }
}

// load form from checkout and Insert user address in to db 
exports.adddatas = async (req, res,next) => {
    try {
        const user=req.session.user_id
        const {name,mobile,address,locality,pincode,district,state}=req.body
        const exisisting= await Address.findOne({user:user})
        if(!exisisting){
            const newAddress= new Address({
                user,
                address:[{name,mobile,address,locality,pincode,district,state}]
            })
            await newAddress.save()
            res.redirect('/checkout')
        }else{
            await Address.findOneAndUpdate({user:user},{$push:{address:[{name,mobile,address,locality,pincode,district,state}]}})
            res.redirect('/checkout')
        }
    }
    catch (error) {
        next(error.message);
    }
}

// remove address from db
exports.removeAdrs = async (req, res,next) => {
    try {
        const user=req.session.user_id
        const id=req.query.adsid
        await Address.findOneAndUpdate({user:user},{$pull:{address:{_id:id}}})
        res.redirect('/address')
    }
    catch (error) {
        next(error.message);
    }
}

 // remove address from db from checkout
 exports.removeAdrr = async (req, res,next) => {
    try {
        const user=req.session.user_id
        const id=req.query.adsid
        await Address.findOneAndUpdate({user:user},{$pull:{address:{_id:id}}})
        res.redirect('/checkout')
    }
    catch (error) {
       next(error.message);
    }
 }

//edit address of the user
exports.editAddress = async (req, res,next) => {
    try {
        const id = req.session.user_id;
        const addressid = req.query.adsid;
        const user=await User.find({_id:id})
        const address = await Address.findOne({ user:id });

        if (!address) {
            return res.status(404).send('Address not found');
        }

        const addressObject = address.address.find(
            (address) => address._id.toString() === addressid
        );

        if (!addressObject) {
            return res.status(404).send('Address object not found');
        }
        res.render('editaddress', { user: user, adrsData:addressObject});
    } catch (error) {
        next(error.message);
    }
};

//edit address of the user from chekout
exports.editAddress1 = async (req, res,next) => {
    try {
        const id = req.session.user_id;
        const addressid = req.query.adsid;
        const user= await User.find({_id:id})
        const address = await Address.findOne({ user: id});
 
        if (!address) {
            return res.status(404).send('Address not found');
        }
 
        const addressObject = address.address.find(
            (address) => address._id.toString() === addressid
        );
 
        if (!addressObject) {
            return res.status(404).send('Address object not found');
        }
        res.render('editaddrscart', { user:user, adrsData:addressObject});
    } catch (error) {
        next(error.message);
    }
 };

// update the current address
exports.updateAddress= async (req, res,next) => {
    try {
        const user=req.session.user_id
        const id=req.query.adsid
        const {name,mobile,address,locality,pincode,district,state}=req.body
        await Address.updateOne(
            { user: user, "address._id":id },
            {
              $set: {
                "address.$.name": name,
                "address.$.mobile": mobile,
                "address.$.address": address,
                "address.$.locality": locality,
                "address.$.district": district,
                "address.$.state": state,
                "address.$.pincode": pincode,
              },
            }
          );
        const message='Address Updated'
        res.redirect('/address?status=success&message='+ encodeURIComponent(message))
    }
    catch (error) {
        next(error.message);
    }
}

// update the current address
exports.updateAddress1= async (req, res,next) => {
    try {
        const user=req.session.user_id
        const id=req.query.adsid
        console.log(id)
        const {name,mobile,address,locality,pincode,district,state}=req.body
        await Address.updateOne(
            { user: user, "address._id":id },
            {
              $set: {
                "address.$.name": name,
                "address.$.mobile": mobile,
                "address.$.address": address,
                "address.$.locality": locality,
                "address.$.district": district,
                "address.$.state": state,
                "address.$.pincode": pincode,
              },
            }
          );
        res.redirect('/checkout')
    }
    catch (error) {
        next(error.message);
    }
}