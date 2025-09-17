const bcrypt = require('bcryptjs');
const { prisma } = require('../db');
const { signJwt } = require('../utils/jwt');
const { setAuthCookie } = require('../helpers/cookie');
const { loginAttempts, MAX_ATTEMPTS, BLOCK_TIME } = require('../helpers/loginAttempts');


// Registro de usuario
async function register(req, res) {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { name, email, phone, password } = req.body;
        const exists = await prisma.user.findUnique({ where: { email } });

        // Si ya existe un usuario con ese email, devolver error 409
        if (exists) return res.status(409).json({ error: 'Email already in use' });

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, phone, passwordHash, role: 'USER' },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        });
        return res.status(201).json(user);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal error' });
    }
}

async function login(req, res) {
    try {

        // Extraer datos del cuerpo de la solicitud
        const { email, password } = req.body;
        const ip = req.ip;

        // Validar campos
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        // Verificar intentos de login
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        // Manejar intentos fallidos
        if (!ok) {
            loginAttempts[ip].count++;
            if (loginAttempts[ip].count >= MAX_ATTEMPTS) {
                loginAttempts[ip].blockedUntil = Date.now() + BLOCK_TIME;
                loginAttempts[ip].count = 0;
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Resetear contador en login exitoso
        else {
            loginAttempts[ip].count = 0;
        }

        // Generar y enviar token JWT en cookie HTTP-only
        const token = signJwt({ id: user.id, role: user.role });
        setAuthCookie(res, token);
        return res.json({
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal error' });
    }
}

// Logout
function logout(req, res) {

    // Borrar la cookie del token
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ ok: true });
}

// Obtener datos del usuario autenticado
async function getMe(req, res) {
    try {

        // Buscar usuario por ID
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
}

module.exports = { register, login, logout, getMe };
