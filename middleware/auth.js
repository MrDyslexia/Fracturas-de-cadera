// middleware/auth.js
const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  // normaliza requiredRoles a UPPERCASE una sola vez
  const requiredUpper = (requiredRoles || []).map(r => String(r).toUpperCase());

  return (req, res, next) => {
    const header = (req.headers.authorization || '').trim();
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) {
      // opcional: WWW-Authenticate ayuda a clientes
      res.set('WWW-Authenticate', 'Bearer');
      return res.status(401).json({ error: 'Token requerido' });
    }

    try {
      const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
      const payload = jwt.verify(token, secret);
      // payload esperado: { id, correo, roles: [...] }
      req.user = payload;

      if (requiredUpper.length) {
        const userRolesUpper = (payload.roles || []).map(r => String(r).toUpperCase());
        const has = userRolesUpper.some(r => requiredUpper.includes(r));
        if (!has) return res.status(403).json({ error: 'Permisos insuficientes' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
}

module.exports = { auth }; 