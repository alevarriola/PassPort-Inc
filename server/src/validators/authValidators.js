const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    email: z.string().email().max(100).trim(),
    phone: z.string().min(5).max(20).trim(),
    password: z.string().min(6).max(100),
});

const loginSchema = z.object({
    email: z.string().email().max(100).trim(),
    password: z.string().min(6).max(100),
});

module.exports = { registerSchema, loginSchema };
