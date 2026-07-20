const { error } = require("../utils/responseHandler");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return error(res, "Unauthorized. Authentication required.", 401);
      }

      const userRoles = req.user["cognito:groups"] || [];

      const hasRole = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasRole) {
        return error(
          res,
          "Forbidden. You do not have permission to access this resource.",
          403
        );
      }

      next();
    } catch (err) {
      return error(res, "Authorization failed.", 500);
    }
  };
};

module.exports = authorize;
