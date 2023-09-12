const offers = require("../model/offermodel");
const Offer = offers;

// Load the offer page
exports.offerpage = async (req, res, next) => {
  try {
    const offers = await Offer.find({});
    res.render("adminOffers",{offers:offers});
  } catch (error) {
    next(error);
  }
};

// Load the add offer page
exports.addOfferpage = async (req, res, next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    res.render("addoffers", { status,message});
  } catch (error) {
    next(error);
  }
};

// add the new offer to the db
exports.addOffer = async (req, res, next) => {
  try {
    let { name, discount, expiryDate } = req.body;
    name = name.toUpperCase();

    const offerExists = await Offer.findOne({ name });
    if (offerExists) {
      const message = "Offer Already Exists";
      res.redirect(
        "/admin/offers/addoffer?status=success&message=" + encodeURIComponent(message)
      );
    }
    await Offer({ name, discount, expiryDate }).save();
    res.redirect("/admin/offers");
  } catch (error) {
    next(error);
  }
};

// Load the edit offer page
exports.editOfferpage = async (req, res, next) => {
  try {
    const status = req.query.status || "";
    const message = req.query.message || "";
    const id=req.query.id
    const offer= await Offer.findOne({_id:id})
    res.render("editoffers",{offer:offer,status,message});
  } catch (error) {
    next(error);
  }
};

// update the changes to the database
exports.editOffer= async (req,res,next)=>{
    try {
        const id = req.params.id
        let name = req.body.name
        let discount = req.body.discount
        name = name.toUpperCase();
        const offerExists = await Offer.findOne({ name })
        if (offerExists && offerExists._id != id) {
            const message = 'Offer already exists'
            return res.redirect(
              `/admin/editOffer?id=${id}?status=success&message=` +
                encodeURIComponent(message)
            );
        }

        if (req.body.expiryDate) {
            await Offer.updateOne({ _id: id }, {
                $set: { name, discount, expiryDate: req.body.expiryDate }
            })
        } else {
            await Offer.updateOne({ _id: id }, {
                $set: { name, discount }
            })
        }
        res.redirect('/admin/offers')
    } catch (error) {
        next(error)
    }
}

// List and unlist the offer
exports.unlist = async (req, res, next) => {
  try {
    const id= req.query.id
    const offer= await Offer.findOne({_id:id})
    if(offer.status === true){
        await Offer.updateOne({_id:id},{$set:{status:false}})
    }else{
        await Offer.updateOne({ _id: id }, { $set: { status: true } });
    }
    res.redirect('/admin/offers')
  } catch (error) {
    next(error);
  }
};