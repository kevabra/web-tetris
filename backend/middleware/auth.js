const jwt = require('jsonwebtoken');

// Middleware to check for valid JWT
const authenticateToken = (req, res, next) => {
  // Get token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token, forbidden

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
