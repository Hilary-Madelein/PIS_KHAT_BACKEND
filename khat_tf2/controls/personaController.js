'use strict';
var models = require('../models/');
var rol = models.rol;
var persona = models.persona;
const bcrypt = require('bcrypt');
const saltRounds = 8;
const { validationResult } = require('express-validator');
class personaController {

    async modificar(req, res) {
        var person = await persona.findOne({
            where: {
                externalId: req.body.externalId
            }
        })
        if (person === null) {
            res.json({
                msg: "NO EXISTE EL REGISTRO",
                code: 400
            })
        } else {
            var uuid = require('uuid');

            person.identificacion = req.body.identificacion;
            person.tipo_Identificacion = req.body.tipoIdentificacion;
            person.nombres = req.body.nombres;
            person.apellidos = req.body.apellidos;
            person.direccion = req.body.direccion;
            person.externalId = uuid.v4();
            var result = await person.save();

            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO SUS DATOS!",
                    code: 400
                })
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO SUS DATOS!",
                    code: 200
                })
            }
        }
    }

    async obtener(req, res) {
        const external = req.params.external;
        var lista = await persona.findOne({
            where: {
                externalId: external
            },
            attributes: [
                'nombres',
                'apellidos',
                'direccion',
                'tipo_Identificacion',
                'identificacion'
            ],
            include: [{
                model: models.cuenta,
                as: "cuenta",
                attributes: [
                    'correo'
                ]
            }]
        });
        if (lista === null) {
            lista = {};
        }
        res.json({
            msg: "OK!",
            code: 200,
            info: lista
        })
    }

    async listar(req, res) {
        var lista = await persona.findAll({
            attributes: [
                'nombres',
                'apellidos',
                'direccion',
                'tipo_Identificacion',
                'identificacion'
            ],
            include: [{
                model: models.cuenta,
                as: "cuenta",
                attributes: [
                    'correo'
                ]
            }]
        });
        res.json({
            msg: "OK!",
            code: 200,
            info: lista
        })
    }
    
    async guardar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            //DERECHA BD = IZQUIERDA APODO PARA GUARDAR
            const id_rol = req.body.external_rol;
            if (id_rol == undefined) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400
                });
            }

            const rolAux = await rol.findOne({
                where: {
                    externalId: id_rol
                }
            });
            console.log(rolAux);

            if (!rolAux) {
                return res.status(400).json({
                    msg: "DATOS NO ENCONTRADOS",
                    code: 400
                });
            }

            const claveHash = (clave) => {
                return bcrypt.hashSync(clave, bcrypt.genSaltSync(saltRounds), null);
            };

            const data = {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                direccion: req.body.direccion,
                tipo_Identificacion: req.body.tipoIdentificacion,
                identificacion: req.body.identificacion,
                id_rol: rolAux.id,
                cuenta: {
                    correo: req.body.correo,
                    clave: claveHash(req.body.clave)
                }
            };

            const uuid = require('uuid');
            data.externalId = uuid.v4();

            const transaction = await models.sequelize.transaction();
            await persona.create(data, {
                include: [
                    {
                        model: models.cuenta,
                        as: "cuenta"
                    }
                ],
                transaction
            });
            await transaction.commit();

            return res.status(200).json({
                msg: "SE HAN REGISTRADO SUS DATOS",
                code: 200
            });
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
module.exports = personaController;