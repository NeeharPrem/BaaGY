const admin = require('../model/adminmodel');
const Admin = admin
exports.isLogin = (req, res, next) => {
    try {
        if (req.session.admin_id) {
            next()
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

exports.isLogout = (req, res, next) => {
    try {
        if (req.session.admin_id) {
            res.redirect('/admin/adminpanel')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}