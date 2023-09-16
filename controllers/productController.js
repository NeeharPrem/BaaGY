const product = require('../model/productmodel');
const Products=product
const category = require('../model/categorymodel');
const Cat = category
const offers = require('../model/offermodel');
const Offer = offers

// Load Products page
exports.loadPage = async (req,res)=>{
    try{
        const admin= req.session.admin_id
        if(admin){
            const offerData = await Offer.find({})
            const pdtData = await Products.find({}).populate("category");
            res.render("adminproducts", { prdts: pdtData,offers:offerData});
        }else{
            res.redirect('/admin/')
        }
    }
    catch(error){
        console.log(error.message);
    }
}

// Load page to add new product
exports.addProduct = async (req,res)=>{
    try{
        const cats= await Cat.find({status:false})
        res.render('addProduct',{catData:cats})
    }
    catch(error){
        console.log(error.message);
    }
}

// unlist product
exports.unlistPrdt = async (req,res)=>{
    try{
        const id = req.query.id;
        const prdts= await Products.findById({_id:id});
        if(prdts.status==false){
            await Products.updateOne({_id:id},{$set:{status:true}});
            res.redirect('/admin/product');
        }else{
            await Products.updateOne({_id:id},{$set:{status:false}});
             res.redirect('/admin/product');
        }
    }
    catch(error){
        console.log(error.message);
    }
}

// Edit product
exports.editProduct = async (req,res)=>{
    try{
        const cats= await Cat.find({status:false})
        const id=req.query.id
        const prdts=await Products.findOne({_id:id})
        const category = cats.find(cat => cat._id.equals(prdts.category));
        res.render('editProduct',{catData:cats,prdData:prdts,catname:category})
    }
    catch(error){
        console.log(error.message);
    }
}

// Update product
exports.productUpdate=async(req,res)=>{
    try {
        const id = req.query.id
        const {name,brand,quantity,description,category,actual,price,discount,material}=req.body
        const img=[]
        for(let file of req.files){
            img.push(file.filename)
        }
        await Products.findByIdAndUpdate({_id:id},{$push:{img:{$each:img}},$set:{
            name : name,
            price : price,
            actual: actual,
            discount: discount,
            brand:brand,
            actual:actual,
            quantity:quantity,
            description : description,
            category : category,
            material: material }      
        })
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error);
    }
}

// Delete image
exports.deleteimg = async (req,res)=>{
    try{
        const id=req.query.id
        const imgUrl=req.query.imageURL
        const result = await Products.findByIdAndUpdate({ _id: id },{$pull:{img:imgUrl}});
        res.redirect(`/admin/editproduct?id=${id}`)
    }
    catch(error){
        console.log(error.message);
    }
}

// Add new products to the DB
exports.newProduct = async (req,res)=>{
    try{
       const {name,brand,quantity,description,category,files,actual,price,discount,material}=req.body
       const img=[]
        for(let file of req.files){
            img.push(file.filename)
        }
        const newProduct = new Products({
            name:name,
            brand: brand,
            price:price,
            quantity: quantity,
            description:description,
            category:category,
            img:img,
            actual: actual,
            discount: discount,
            material:material,
        });
        // Save the new user to the DB
        await newProduct.save();
        res.redirect('/admin/product')
    }
    catch(error){
        console.log(error.message);
    }
}

// apply offer in products
exports.productOffer = async (req, res, next) => {
    try {
        console.log(req.body)
        const pdtId = req.body.id
        const offerId = req.body.offerId
        const product= await Products.findOne({_id:pdtId})
        const offerData = await Offer.findOne({_id:offerId})
        const price = product.actual
        if (product.offer && product.offerAppliedBy == 'category') {
            const oldOfferPrice = product.offerPrice
            const offerPrice = Math.round(price - ((price * offerData.discount) / 100))
            await Products.updateOne({ _id: pdtId }, {
                $set: {
                    offer: offerId,
                    price: offerPrice,
                    offerAppliedBy: 'product'
                }
            })
        } else {
            const offerPrice = Math.round(price - ((price * offerData.discount) / 100))
            const oldprice = product.price
            await Products.updateOne({ _id:pdtId }, {
                $set: {
                    offerPrice: oldprice,
                    offer: offerId,
                    price: offerPrice,
                    offerAppliedBy: 'product'
                }
            })
        }
        res.redirect('/admin/product')
    } catch (error) {
        next(error);
    }
};
// Remove the applied offer from the product
exports.removeOffer = async (req, res, next) => {
    try {
        const Id= req.body.id
        const productData = await Products.findOne({ _id: Id})
        let newPrice = productData.offerPrice
        console.log(newPrice)
        await Products.updateOne({ _id:Id, offerAppliedBy: 'product' }, {
            $set: {
                price: newPrice
            }
        })
        await Products.updateOne({ _id:Id}, {
            $unset: { offer: "", offerPrice: "", offerAppliedBy: "" }
        })
        res.redirect('/admin/product')
    } catch (error) {
        next(error)
    }
}