const jwt = require('jsonwebtoken');
const config = require('../config/env');

// 1. STRICT AUTH (Blocks access if not logged in)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return next({ status: 401, message: 'Authorization token missing' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Invalid or expired token' });
  }
};

// 2. OPTIONAL AUTH (Identifies user if logged in, but allows Guests)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // If no token, simply proceed as Guest (req.user remains undefined)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.id, role: payload.role }; // User identified!
  } catch (err) {
    // Token invalid/expired? Ignore and treat as Guest.
    console.log("Optional Auth: Token invalid, proceeding as guest.");
  }
  
  next();
};

const buildRoleChecker = (roles) => {
  const allowed = new Set(Array.isArray(roles) ? roles : [roles]);
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next({ status: 401, message: 'Authentication required' });
    }
    if (!allowed.has(req.user.role)) {
      return next({ status: 403, message: 'Insufficient permissions for this action' });
    }
    return next();
  };
};

const allowRoles = (roles) => [requireAuth, buildRoleChecker(roles)];
const requireRole = (roles) => buildRoleChecker(roles);

module.exports = { 
  requireAuth, 
  optionalAuth, 
  requireRole, 
  allowRoles 
};