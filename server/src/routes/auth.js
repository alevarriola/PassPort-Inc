const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../db');
const { signJwt } = require('../utils/jwt');
const { isAuth } = require('../middlewares/auth');


const router = express.Router();

// Helper para setear la cookie
function setAuthCookie(res, token) {
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    const isProd = process.env.NODE_ENV === 'production';
    // Setea la cookie
    res.cookie(cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd, // true en HTTPS/producción
        maxAge: Number(process.env.JWT_EXPIRES_IN || 3600) * 1000,
    });
}


// POST /auth/register (público, crea user normal)
router.post('/register', async (req, res) => {
    try {
        // Valida campos
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: 'Missing fields' });
            }

        // Verifica si el email ya está en uso
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ error: 'Email already in use' });

        // Hashea la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crea el usuario
        const user = await prisma.user.create({
            data: { name, email, phone, passwordHash, role: 'USER' },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        });


        return res.status(201).json(user);

    } 
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal error' });
    }
});


// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        // Valida campos
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        // Busca el usuario
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Verifica la contraseña
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        // Crea el JWT y setea la cookie
        const token = signJwt({ id: user.id, role: user.role });
        setAuthCookie(res, token);

        // Retorna datos del user (sin passwordHash)
        return res.json({
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    } 
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal error' });
    }
});


// POST /auth/logout
router.post('/logout', (req, res) => {
    // Borra la cookie
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ ok: true });
});


// GET /auth/me
router.get('/me', isAuth, async (req, res) => {
    try {
        // Busca el usuario por ID
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        });

        // Si no existe, error
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } 
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});


module.exports = router;