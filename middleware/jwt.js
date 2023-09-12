const jwt=require('jsonwebtoken')
exports.signinverify = async (req,res,next) => {
    try {
      const token = req.session.token;
      const key=process.env.jwtKey
      if (token) {
        const decode = jwt.verify(token, key );
  
        if (decode) {
          req.user = decode;
          next();
        }
      }
    } catch (err) {
        res.redirect('/')
      console.log(err);
      res.status(401).json({ message: 'Unauthorized' });
    }
  }