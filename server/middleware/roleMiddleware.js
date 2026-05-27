export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, missing profile' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource` 
      });
    }
    next();
  };
};
