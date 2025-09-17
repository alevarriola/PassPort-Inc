const bcrypt = require('bcryptjs');
const { prisma } = require('../db');
const userSelect = { id: true, name: true, email: true, phone: true, role: true, createdAt: true };

// Listar usuarios
async function listUsers(req, res) {
    try {
        const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
        res.json({ users });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
}

// Crear usuario
async function createUser(req, res) {
    try {
        const data = req.body;
        const existing = await prisma.user.findUnique({ where: { email: data.email } });

        // Si ya existe un usuario con ese email, devolver error 409
        if (existing) return res.status(409).json({ error: 'Email ya registrado' });

        // Hashear la contraseña antes de guardar
        const passwordHash = await bcrypt.hash(data.password, 10);
        const created = await prisma.user.create({
            data: { name: data.name, email: data.email, phone: data.phone, role: data.role, passwordHash },
            select: userSelect,
        });

        res.status(201).json({ user: created });
    } catch (e) {
        if (e?.issues) return res.status(400).json({ error: e.issues.map(i => i.message).join(', ') });
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
}

// Ver usuario
async function getUser(req, res) {
    try {

        // Buscar usuario por ID
        const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
        if (!user) return res.status(404).json({ error: 'No encontrado' });
        res.json({ user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
}

// Editar usuario
async function updateUser(req, res) {
    try {
        const patch = req.body;

        // No permitir cambiar el rol
        if ('role' in patch) delete patch.role;

        // Si se cambia el email, verificar que no exista otro usuario con ese email
        if (patch.email) {
            const exists = await prisma.user.findUnique({ where: { email: patch.email } });
            if (exists && exists.id !== req.params.id) {
                return res.status(409).json({ error: 'Email ya en uso' });
            }
        }

        // Actualizar usuario
        const updated = await prisma.user.update({ where: { id: req.params.id }, data: patch, select: userSelect });
        res.json({ user: updated });
    } catch (e) {
        if (e?.issues) return res.status(400).json({ error: e.issues.map(i => i.message).join(', ') });
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
}

async function deleteUser(req, res) {
    try {
        // Prevenir que un admin se borre a sí mismo
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'No podés borrarte a vos mismo bobo' });
        }

        // Borrar usuario
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (e) {
        if (e?.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
