const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error("Not Authorized")
        error.statusCode = 401;
        throw error;
    }
    const bearer = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];
    let decodedToken;
    if (bearer === "Bearer-Owner") {
        try {
            decodedToken = jwt.verify(token, "ownerissecureandprioritized")
        } catch (error) {
            error.statusCode = 500;
            next(error)
        }
    }
    else {
        try {
            decodedToken = jwt.verify(token, "thesupersecretshit")
        } catch (error) {
            error.statusCode = 500;
            next(error)
        }
    }

    if (!decodedToken) {
        res.status(422).json({ message: "Not Authenticated!" });
    }
    else {
        req.userId = decodedToken.userId;
    }
    next();
}