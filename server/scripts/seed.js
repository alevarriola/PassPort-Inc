require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/db');


async function main() {
const name = process.env.ADMIN_NAME || 'Admin';
const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const phone = process.env.ADMIN_PHONE || '+595000000000';
const password = process.env.ADMIN_PASSWORD || 'admin123';


const passwordHash = await bcrypt.hash(password, 10);


const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
console.log(`Admin ya existe: ${email}`);
return;
}


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


main()
.catch((e) => {
console.error(e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});