require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/db');

// Crea un admin si no existe
async function main() {
    // Datos del admin desde variables de entorno o por defecto
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const phone = process.env.ADMIN_PHONE || '+595000000000';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    // Hashea la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Verifica si ya existe el admin
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
    console.log(`Admin ya existe: ${email}`);
    return;
    }

    // Crea el admin si no existe
    const admin = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            passwordHash,
            role: 'ADMIN'
        }
    });


    console.log('Admin creado:', { id: admin.id, email: admin.email });
    }

// Ejecuta el script
main()
.catch((e) => {
console.error(e);
process.exit(1);
})

// Asegura que la conexión a la base de datos se cierre al finalizar
.finally(async () => {
await prisma.$disconnect();
});