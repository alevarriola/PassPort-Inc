const { verifyJwt } = require('../utils/jwt');

// Middleware para proteger rutas
function isAuth(req, res, next) {
    // Lee el token de la cookie
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    const token = req.cookies[cookieName];

    // Si no hay token, no está autenticado
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    // Verifica el token
    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });

    // Adjunta el payload al request
    req.user = payload; // { id, role }
    next();
}

// Middleware para verificar si el usuario es admin
function isAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
}

// Middleware para verificar si el usuario es admin o es él mismo
function isSelfOrAdmin(req, res, next) {
    if (req.user?.role === 'ADMIN') return next();
    if (req.user?.id === req.params.id) return next();
    return res.status(403).json({ error: 'Forbidden' });
}


module.exports = { isAuth, isAdmin, isSelfOrAdmin };