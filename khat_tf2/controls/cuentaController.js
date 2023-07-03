'use strict'

var models = require('../models/')
var cuenta = models.cuenta;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');

class cuentaController {
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
                    attributes: [
                        'nombres',
                        'apellidos'
                    ], 
                    include: [{
                        model: models.rol,
                        as: "rol",
                        attributes: [
                            'tipo'
                        ]
                    }]
                }

                ]
            });
            if (login === null) {
                return res.status(400).json({
                    msg: "Cuenta no encontrada",
                    code: 400
                })
            } else {
                var esClaveValida = function (clave, claveUser) {
                    return bcrypt.compareSync(claveUser, clave);
                }
                if (login.estado) {
                    if (esClaveValida(login.clave, req.body.clave)) {
                        const tokenData = {
                            external: login.externalId,
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
                            msg: "INICIO SESIÓN CON ÉXITO",
                            token: token,
                            user: login.persona,
                            code: 200
                        })
                    }else{
                        return res.status(401).json({
                            msg: "Clave incorrecta",
                            code: 401
                        })
                    }
                    
                }else{
                    return res.status(200).json({
                        msg: "Cuenta desactivada",
                    });
                }
            }


        } catch (error) {
            if (error.errors && error.errors[0].message) {
                return res.status(200).json({
                    msg: error.errors[0].message,
                    code: 200
                });
            } else {
                return res.status(200).json({
                    msg: "Ha ocurrido un error en el servidor",
                    code: 200
                });
            }
        }
    }
}
module.exports = cuentaController;
