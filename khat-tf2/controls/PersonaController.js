'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var rol = models.rol;
var cuenta = models.cuenta;
const bcypt = require('bcrypt');
const salRounds = 8;

class PersonaController {

    async listar(req, res) {
        var listar = await persona.findAll({
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion'],
            include: {
                model: cuenta,
                as: 'cuenta',
                attributes: ['correo']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listarDadosBaja(req, res) {
        const listar = await persona.findAll({
            where: {
                estado: false
            },
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion'],
            include: {
                model: cuenta,
                as: 'cuenta',
                attributes: ['correo']
            },            
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listarActivos(req, res) {
        
        const listar = await persona.findAll({
            where: { estado: true },
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion'],
            include: {
                model: cuenta,
                as: 'cuenta',
                attributes: ['correo']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    
    

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await persona.findOne({
            where: { external_id: external },
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion', 'estado'],
        });
        if (listar === null) {
            console.log("ESTAMOS PERDIDAS");
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);  
        if (errors.isEmpty()) {
            var rol_id = req.body.external_rol;
            console.log("ESTOS", req.body);
            if (rol_id != undefined) {
                let rolAux = await rol.findOne({ where: { external_id: rol_id } });
                if (rolAux) {
                    var claveHash = function (clave) {
                        return bcypt.hashSync(clave, bcypt.genSaltSync(salRounds), null);
                    };
                    var data = {
                        identificacion: req.body.identificacion,
                        tipo_identificacion: req.body.dni_tipo,
                        nombres: req.body.nombres,
                        apellidos: req.body.apellidos,
                        direccion: req.body.direccion,
                        fecha_nacimiento: req.body.fecha_nacimiento,
                        telefono: req.body.telefono,
                        persona_rol: {
                            id_rol: rolAux.id
                        },
                        cuenta: {
                            correo: req.body.correo,
                            clave: claveHash(req.body.clave)
                        }
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await persona.create(data, {
                            include: [{
                                model: models.cuenta,
                                as: "cuenta"
                            },
                            {
                                model: models.persona_rol,
                                as: "persona_rol"
                            }
                            ]
                            , transaction
                        });
                        await transaction.commit();
                        res.json({
                            msg: "SUS DATOS SE HAN REGISTRADO EXITOSAMENTE",
                            code: 200
                        });

                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        if (error.errors && error.errors[0].message) {
                            res.json({ msg: error.errors[0].message, code: 200 });
                        } else {
                            res.json({ msg: error.message, code: 200 });
                        }
                    }
                } else {
                    res.status(400);
                    res.json({ msg: "Datos no encontrados", code: 400 });
                }

            } else {
                res.status(400);
                res.json({ msg: "Faltan datos", code: 400 });
            }
        } else {
            res.status(400);
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }

    }

    async modificar(req, res) {
        var person = await persona.findOne({ where: { external_id: req.body.external } });
        if (person === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400 
            }); 
        } else {
            var uuid = require('uuid');
            person.nombres = req.body.nombres;
            person.apellidos = req.body.apellidos;
            person.direccion = req.body.direccion;
            person.fecha_nacimiento = req.body.fecha_nacimiento;
            person.telefono = req.body.telefono;
            person.external_id = uuid.v4();
            var result = await person.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO SUS DATOS",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "DATOS MODIFICADOS EXITOSAMENTE",
                    code: 200
                });
            }
        }
    }

    async cambiarEstado(req, res) {
        var person = await persona.findOne({ where: { external_id: req.body.external } });
        if (person === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400 
            });  
        } else { 
            var uuid = require('uuid');
            person.estado = req.body.estado;
            person.external_id = uuid.v4();
            var result = await person.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HA MODIFICADO EL ESTADO",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "CAMBIO DE ESTADO EXITOSO",
                    code: 200
                });
            }
        }
    }
}
module.exports = PersonaController;