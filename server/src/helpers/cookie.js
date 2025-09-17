// Helper para configurar la cookie de autenticación
function setAuthCookie(res, token) {
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: Number(process.env.JWT_EXPIRES_IN || 3600) * 1000,
    });
}

module.exports = { setAuthCookie };
