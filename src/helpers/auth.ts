const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({msg: 'A token is required for authentication'});
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({msg: 'Invalid Token'}); 
  }
  return next();
};

export default verifyToken;
