const authorize = (...allowed) => {
    return (req, res, next) => {
        console.log("Daftar Role yang diizinkan rute:", allowed);
        console.log("Role asli yang menembak dari Postman:", req.user?.role);
        console.log("Apakah COCOK?:", allowed.includes(req.user?.role));
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        next();
    };
};

module.exports = authorize;