const express = require('express');
const { z } = require('zod');
const { prisma } = require('../db');
const { isAuth, isAdmin, isSelfOrAdmin } = require('../middleware/auth');


const router = express.Router();


// Schemas y selectores
const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

// Para actualizaciones, todo opcional
const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
});

// Campos que devolvemos al cliente (sin passwordHash)
const userSelect = { id: true, name: true, email: true, phone: true, role: true, createdAt: true };


// ----- Endpoints ----- //


// GET /users — Lista completa (solo admin)
router.get('/', isAuth, isAdmin, async (req, res) => {
    try {
        // Listamos todos los usuarios
        const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
        res.json({ users });
    } 
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});


// POST /users — Crear usuario (solo admin)
router.post('/', isAuth, isAdmin, async (req, res) => {
    try {
        // Valida datos
        const data = createUserSchema.parse(req.body);
        const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    // Hashea la contraseña
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Crea el usuario
    const created = await prisma.user.create({
    data: { name: data.name, email: data.email, phone: data.phone, role: data.role, passwordHash },
    select: userSelect,
    });

    // Retorna el usuario creado
    res.status(201).json({ user: created });
    } 
    catch (e) 
    {
    if (e?.issues) return res.status(400).json({ error: e.issues.map(i => i.message).join(', ') });
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
    }
});

// GET /users/:id — Ver un usuario (propio o admin)
router.get('/:id', isAuth, isSelfOrAdmin, async (req, res) => {
    try {
        // Busca el usuario por ID
        const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
        if (!user) return res.status(404).json({ error: 'No encontrado' });
        res.json({ user });
    } 
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});


// PUT /users/:id — Editar (propio o admin)
router.put('/:id', isAuth, isSelfOrAdmin, async (req, res) => {
    try {
        const patch = updateUserSchema.parse(req.body);


        // Si el usuario intenta cambiar su rol, lo ignoramos.
        if ('role' in patch) delete patch.role;


        // Bloquear cambios de email duplicado
        if (patch.email) {
            const exists = await prisma.user.findUnique({ where: { email: patch.email } });
            if (exists && exists.id !== req.params.id) {
                return res.status(409).json({ error: 'Email ya en uso' });
            }
        }

        // Actualiza el usuario
        const updated = await prisma.user.update({ where: { id: req.params.id }, data: patch, select: userSelect });
        res.json({ user: updated });
    } 
    catch (e) {
        if (e?.issues) return res.status(400).json({ error: e.issues.map(i => i.message).join(', ') });
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});

// DELETE /users/:id — Borrar (solo admin)
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
    try {
        // No permitir que un admin se borre a sí mismo por accidente
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'No podés borrarte a vos mismo bobo' });
        }
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    }  
    catch (e) {
        if (e?.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});


module.exports = router;