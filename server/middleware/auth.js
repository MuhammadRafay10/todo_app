const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied!" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ error: "Token verification failed!" });
    }

    req.user = verified.id;
    next(); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = auth;