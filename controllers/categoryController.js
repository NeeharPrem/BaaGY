const { findOneAndDelete, findOneAndUpdate, findOne } = require('../model/adminmodel');
const category = require('../model/categorymodel');
const Cat = category
const offers = require('../model/offermodel');
const Offer = offers
const product = require('../model/productmodel');
const Products = product

// load category page
exports.loadCategory = async (req, res) => {
    try {
        const status = req.query.status || '';
        const message = req.query.message || '';
        const catData = await Cat.find({})
        const offerData = await Offer.find({})
        res.render('Category', { cats: catData, status, message, offers: offerData })
    } catch (error) {

    }
}

// add new Category
exports.addCat = async (req, res) => {
    try {
        const name = req.body.name
        const img = []
        for (let file of req.files) {
            img.push(file.filename)
        }
        const existingCat = await Cat.findOne({ name: name })
        if (existingCat) {
            const message = 'Category is existing';
            return res.redirect('/admin/category?status=success&message=' + encodeURIComponent(message));
        } else {
            const newCat = new Cat({
                name,
                img: img,
            });
            // Save the new category to the DB
            await newCat.save();
            const message = 'Category added';
            return res.redirect('/admin/category?status=success&message=' + encodeURIComponent(message));
        }
    } catch (error) {

    }
}

// add category image
exports.addImage = async (req, res) => {
    try {
        const id = req.body.id
        const img = []
        for (let file of req.files) {
            img.push(file.filename)
        }
            await Cat.findOneAndUpdate({ _id: id }, { $push: { img: { $each: img } } })
            return res.redirect('/admin/category');   
    } catch (error) {

    }
}

// edit Category
exports.editCat = async (req, res) => {
    try {
        const name = req.body.name
        const id = req.body.categoryId
        console.log(req.files,req.body)
        const img=[]
        for(let file of req.files){
            img.push(file.filename)
        }
        await Cat.findOneAndUpdate({ _id: id }, { $push: { img: { $each: img } },$set: { name: name } })
        return res.redirect('/admin/category');
    } catch (error) {
        console.log(error);
    }
}

// delete category image
exports.deletecatimg = async (req, res) => {
    try {
        console.log(req.query.id)
        // const name = req.body.name
        // const imgUrl = req.query.imageURL

        // await Cat.findByIdAndUpdate({ _id: id }, { $pull: { img: imgUrl } });
        // return res.redirect('/admin/category');
    } catch (error) {
        console.log(error);
    }
}

// unlist a category
exports.unlist = async (req, res) => {
    try {
        const id = req.query.id;
        const cats = await Cat.findById({ _id: id });
        if (cats.status == false) {
            await Cat.updateOne({ _id: id }, { $set: { status: true } });
            res.redirect('/admin/category');
        } else {
            await Cat.updateOne({ _id: id }, { $set: { status: false } });
            res.redirect('/admin/category');
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

// apply offer on categories
exports.applyOffer = async (req, res, next) => {
    try {
        const catId = req.body.id
        const offerId = req.body.offerId

        await Cat.updateOne(
            { _id: catId },
            {
                $set: {
                    offer: offerId,
                },
            }
        );
        const offerData = await Offer.findOne({ _id: offerId })
        const updatingProducts = await Products.find({ category: catId })
        for (const product of updatingProducts) {
            const price = product.actual
            const oldPrice = product.price
            const offerPrice = Math.round(price - ((price * offerData.discount) / 100))
            await Products.updateOne({ _id: product._id, offer: { $exists: false } },
                {
                    $set: {
                        offerPrice: oldPrice,
                        offer: offerId,
                        price: offerPrice,
                        offerAppliedBy: 'category'
                    }
                }
            )
        }
        res.redirect('/admin/category')
    } catch (error) {
        next(error);
    }
};

// remove the applies offer from the category
exports.removeOffer =async (req,res,next)=>{
    try {
        const catId=req.body.cat
        await Cat.updateOne({ _id: catId }, {
            $unset: {
                offer: ''
            }
        })
        await Products.updateMany({ category: catId, offerAppliedBy: 'category' },
            [{
                $set: {
                    price: '$offerPrice'
                }
            }
            ]
        )
        await Products.updateMany(
            { category: catId, offerAppliedBy: 'category' },
            {
                $unset: { offer: "", offerPrice: "", offerAppliedBy: "" }
            }
        );
        res.redirect('/admin/category')
    } catch (error) {
        next(error)
    }
}