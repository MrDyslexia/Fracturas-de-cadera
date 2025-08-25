// controller/perfil.controller.js
const models = require('../model/initModels');

// Normaliza y mapea a tu convenio del frontend
const ROLE_MAP = {
  'PACIENTE': 'PACIENTE',
  'FUNCIONARIO': 'FUNCIONARIO',
  'TECNOLOGO': 'TECNOLOGO',
  'INVESTIGADOR': 'INVESTIGADOR',
  'ADMIN': 'ADMIN',
};

exports.me = async (req, res) => {
  try {
    // Ajusta según lo que ponga tu middleware auth en req.user
    const userId = req.user?.id || req.user?.userId;

    const user = await models.user.findByPk(userId, {
      attributes: ['id','rut','nombre','correo'],
      include: [{
        model: models.professional_profile,
        as: 'professional_profile',
        attributes: ['cargo','hospital','activo']
      }]
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Construye roles
    const roles = [];
    const cargo = String(user?.professional_profile?.cargo || '').trim().toUpperCase();
    if (ROLE_MAP[cargo]) roles.push(ROLE_MAP[cargo]);

    // si además tienes tabla de roles, aquí los agregas…

    res.json({ me: user, roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
};
