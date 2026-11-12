const authorize = (...allowed) => {
    return (req, res, next) => {
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        next();
    };
};

module.exports = authorize;