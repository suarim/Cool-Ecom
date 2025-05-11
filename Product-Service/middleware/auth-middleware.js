const jwt = require("jsonwebtoken");
const verifyUser = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = token.split(" ")[1];
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const {id,email,role} = jwt.verify(auth, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.id = id;
    req.email = email;
    req.role = role;
    if (!id || !email || !role) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

const AdmminMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = token.split(" ")[1];
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const {id,email,role} = jwt.verify(auth, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.id = id;
    req.email = email;
    req.role = role;
    if (!id || !email || !role) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

module.exports = { verifyUser, AdmminMiddleware };