var models = require('../models')
var cuenta = models.cuenta;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');

class CuentaController {

    async sesion(req, res) {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            var login = await cuenta.findOne({
                where: {
                    correo: req.body.correo
                },
                include: [{
                    model: models.persona,
                    as: "persona",
                    include: [{
                        model: models.persona_rol,
                        as: "persona_rol",
                        include: [{
                            model: models.rol,
                            as: "rol"
                        }]
                    }]
                }]
            });

            if (login === null)
                return res.status(400).json({
                    msg: "Cuenta no encontrada",
                    code: 400
                })

            var esClaveValida = function (clave, claveUser) {
                return bcrypt.compareSync(claveUser, clave);
            }
            
            if (!login.estado) {
                return res.status(400).json({
                    msg: "Cuenta desactivada",
                    code: 400
                });
            }
            if (esClaveValida(login.clave, req.body.clave)) {
                const tokenData = {
                    external: login.external_id,
                    email: login.correo,
                    check: true
                };

                require('dotenv').config();
                const llave = process.env.KEY;
                const token = jwt.sign(
                    tokenData,
                    llave,
                    {
                        expiresIn: '12h'
                    });
                return res.status(200).json({
                    msg: "Bievenido " + login.persona.nombres,
                    info: {
                        token: token,
                        user: {
                            correo: login.correo,
                            nombres: login.persona.nombres,
                            apellidos: login.persona.apellidos,
                            user: login.persona,
                            rol: login.persona.persona_rol[0].rol.tipo
                        },
                    },
                    code: 200
                })
            } else {
                return res.status(401).json({
                    msg: "Clave incorrecta",
                    code: 401
                })
            }

        } catch (error) {
            console.log(error);
            if (error.errors && error.errors[0].message) {
                return res.status(400).json({
                    msg: error.errors[0].message,
                    code: 400
                });
            } else {
                return res.status(400).json({
                    msg: "Ha ocurrido un error en el servidor",
                    code: 400
                });
            }
        }
    }
}
module.exports = CuentaController;