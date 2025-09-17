const express = require('express');
const { isAuth, isAdmin, isSelfOrAdmin } = require('../middlewares/auth');
const { createUserSchema, updateUserSchema } = require('../validators/usersValidators');
const { listUsers, createUser, getUser, updateUser, deleteUser } = require('../controllers/usersController');

const router = express.Router();

// Listar usuarios (solo admin)
router.get('/', isAuth, isAdmin, listUsers);

// Crear usuario (solo admin)
router.post('/', isAuth, isAdmin, (req, res, next) => {
    try {
        req.body = createUserSchema.parse(req.body);
        next();
    } catch (e) {
        if (e?.issues) return res.status(400).json({ error: e.issues.map(i => i.message).join(', ') });
        return res.status(400).json({ error: 'Invalid input' });
    }
}, createUser);

// Ver usuario (propio o admin)
router.get('/:id', isAuth, isSelfOrAdmin, getUser);

// Editar usuario (propio o admin)
router.put('/:id', isAuth, isSelfOrAdmin, (req, res, next) => {
    try {
        req.body = updateUserSchema.parse(req.body);
        next();
    } catch (e) {
        if (e?.issues) return res.status(400).json({ error: e.issues.map(i => i.message).join(', ') });
        return res.status(400).json({ error: 'Invalid input' });
    }
}, updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', isAuth, isAdmin, deleteUser);

module.exports = router;