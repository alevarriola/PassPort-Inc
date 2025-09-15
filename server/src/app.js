require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { prisma } = require('./db');
const authRoutes = require('./routes/auth.routes');


const app = express();
const PORT = process.env.PORT || 4000;


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Ajustar en el front si cambia
    credentials: true
}));
app.use('/auth', authRoutes);


// Healthcheck mínimo
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1;`;
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: 'DB not reachable' });
    }
});


app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});