const express = require('express');
const { isAuth } = require('../middlewares/auth');
const { registerSchema, loginSchema } = require('../validators/authValidators');
const { register, login, logout, getMe } = require('../controllers/authController');
const { loginAttempts, MAX_ATTEMPTS } = require('../helpers/loginAttempts');

const router = express.Router();

// Registro
router.post('/register', (req, res, next) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid input', details: result.error.errors });
    }
    req.body = result.data;
    next();
}, register);

// Login con protección contra fuerza bruta
router.post('/login', (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // Inicializa el seguimiento de intentos si no existe
    if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, blockedUntil: 0 };
    if (loginAttempts[ip].blockedUntil > now) {
        return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    // Valida la entrada
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid input', details: result.error.errors });
    }

    // Pasa los datos validados al controlador
    req.body = result.data;
    next();
}, login);

// Logout
router.post('/logout', logout);

// Obtener datos del usuario autenticado
router.get('/me', isAuth, getMe);

module.exports = router;