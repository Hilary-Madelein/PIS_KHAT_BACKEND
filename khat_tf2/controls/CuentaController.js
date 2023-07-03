'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var cuenta = models.cuenta;
const bcypt = require('bcrypt');
let jwt = require('jsonwebtoken');

class CuentaController {

    async sesion(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            
            var login = await cuenta.findOne({ 
                
                where: { correo: req.body.correo},
                include: {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres']
                } });
            if (login === null) {
                res.status(400);
                res.json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                });
            } else {
                res.status(200);
                var isClaveValida = function (clave, claveUser) {
                    return bcypt.compareSync(claveUser, clave);
                }

                if (login.estado) {
                    if (isClaveValida(login.clave, req.body.clave)) { //login.clave---BD //req.body.clave---lo que manda el correo
                        const tokenData = {
                            external: login.external_id,
                            correo: login.correo,
                            check: true
                        };
                        require('dotenv').config();
                        const llave = process.env.KEY;
                        const token = jwt.sign(tokenData, llave, {
                            expiresIn: '12h'
                        });
                        res.json({
                            msg: "OK!",
                            token: token,
                            user: login.persona.nombres + ' '+login.persona.apellidos,
                            correo: login.correo,
                            code: 200
                        });
                    } else {
                        res.json({
                            msg: "CLAVE INCORRECTA",
                            code: 201
                        });
                    }
                } else {
                    res.json({
                        msg: "CUENTA DESACTIVADA",
                        code: 201
                    });
                }
            }
        } else {
            res.status(400);
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }
    }

}
module.exports = CuentaController;