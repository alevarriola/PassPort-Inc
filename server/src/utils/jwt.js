const jwt = require('jsonwebtoken');

// Crea un JWT
function signJwt(payload, options = {}) {
    const secret = process.env.JWT_SECRET;
    // Firma el token
    return jwt.sign(payload, secret, {
        expiresIn: Number(process.env.JWT_EXPIRES_IN || 3600),
        ...options,
    });
}

// Verifica un JWT
function verifyJwt(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}


module.exports = { signJwt, verifyJwt };