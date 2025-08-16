// middleware/auth.js
const jwt = require("jsonwebtoken");

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token requerido" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
      req.user = payload; // { id, correo, roles: [...] }

      if (requiredRoles.length) {
        const has = payload.roles?.some(r => requiredRoles.includes(r));
        if (!has) return res.status(403).json({ error: "Permisos insuficientes" });
      }
      next();
    } catch {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
}

module.exports = { auth };
