const { PrismaClient } = require('@prisma/client');

// Crea una instancia de Prisma Client
const prisma = new PrismaClient();


module.exports = { prisma };