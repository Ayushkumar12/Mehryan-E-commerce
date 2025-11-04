import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // Check for JWT token in authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If JWT token exists, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }

  // If no JWT token, check for session
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      role: req.session.userRole
    };
    return next();
  }

  // No valid authentication found
  return res.status(401).json({
    success: false,
    message: 'Not authorized to access this route'
  });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user has an active session
export const isSessionActive = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'No active session. Please login first.'
  });
};