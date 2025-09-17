const { z } = require('zod');

const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
});

module.exports = { createUserSchema, updateUserSchema };
