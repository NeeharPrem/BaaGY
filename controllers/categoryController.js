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
        const existingCat = await Cat.findOne({ name: name })
        if (existingCat) {
            const message = 'Category is existing';
            return res.redirect('/admin/category?status=success&message=' + encodeURIComponent(message));
        } else {
            const newCat = new Cat({
                name
            });
            // Save the new category to the DB
            await newCat.save();
            const message = 'Category added';
            return res.redirect('/admin/category?status=success&message=' + encodeURIComponent(message));
        }
    } catch (error) {

    }
}

// edit Category
exports.editCat = async (req, res) => {
    try {
        const name = req.body.name
        const id = req.body.categoryId
        await Cat.findOneAndUpdate({ _id: id }, { $set: { name: name } })
        return res.redirect('/admin/category');
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