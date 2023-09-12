const User = require('../model/usermodel');
exports.isLogin = async (req, res, next) => {
    if (req.session.user_id) {
      try {
        const user = await User.findOne({ _id: req.session.user_id }).exec();
        if (user && user.blocked) {
          req.session.destroy();
          return res.redirect('/login');
        } else {
          return next();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  };
  

exports.isLogout = (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}
