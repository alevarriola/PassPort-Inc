const { verifyJwt } = require('../utils/jwt');


function isAuth(req, res, next) {
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    const token = req.cookies[cookieName];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });


    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });


    req.user = payload; // { id, role }
    next();
}


function isAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
}


function isSelfOrAdmin(req, res, next) {
    if (req.user?.role === 'ADMIN') return next();
    if (req.user?.id === req.params.id) return next();
    return res.status(403).json({ error: 'Forbidden' });
}


module.exports = { isAuth, isAdmin, isSelfOrAdmin };