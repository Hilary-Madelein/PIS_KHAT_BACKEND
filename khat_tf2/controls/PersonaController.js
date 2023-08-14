'use strict';
var models = require('../models');
var persona = models.persona;
const bcrypt = require('bcrypt');
const saltRounds = 8;
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

class PersonaController {

    async guardar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "Faltan datos",
                    code: 400,
                    errors: errors.array()
                });
            }

            const claveHash = (clave) => {
                return bcrypt.hashSync(clave, bcrypt.genSaltSync(saltRounds), null);
            };

            if (!req.file) {
                return res.status(400).json({
                    msg: "Falta cargar la imagen",
                    code: 400
                });
            }
            const rolAux = await models.rol.findOne({
                where: {
                    external_id: req.body.external_rol
                }
            });
            if (!rolAux) {
                return res.status(400).json({
                    msg: "No existe rol",
                    code: 400
                })
            }
            const data = {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                direccion: req.body.direccion,
                tipo_identificacion: req.body.tipo_identificacion,
                identificacion: req.body.identificacion,
                fecha_nacimiento: req.body.fecha_nacimiento,
                telefono: req.body.telefono,
                foto: req.file.filename,
                cuenta: {
                    correo: req.body.correo,
                    clave: claveHash(req.body.clave)
                },
                persona_rol: {
                    id_rol: rolAux.id
                },
            };

            data.external_id = uuid.v4();

            const transaction = await models.sequelize.transaction();
            await persona.create(data, {
                include: [
                    {
                        model: models.cuenta,
                        as: "cuenta"
                    },
                    {
                        model: models.persona_rol,
                        as: "persona_rol"
                    }
                ],
                transaction
            });
            await transaction.commit();
            return res.status(200).json({
                msg: "Se ha registrado la persona",
                code: 200
            });
        } catch (error) {
            console.log(error)
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

    async modificar(req, res) {
        try {
            const personaAux = await persona.findOne({
                where: {
                    external_id: req.body.external_id
                }
            });

            if (!personaAux) {
                return res.status(400).json({
                    msg: "No existe el registro",
                    code: 400
                });
            }

            const cuentaAux = await models.cuenta.findOne({
                where: {
                    id_persona: personaAux.id
                }
            })
            console.log(cuentaAux)
            let imagenAnterior = personaAux.foto;

            if (req.file) {
                // Eliminar la imagen anterior solo si hay una nueva imagen cargada
                if (imagenAnterior) {
                    const imagenAnteriorPath = path.join(__dirname, '../public/images/users/', imagenAnterior);
                    fs.unlink(imagenAnteriorPath, (err) => {
                        if (err) {
                            console.log('Error al eliminar la imagen anterior:', err);
                        } else {
                            console.log("eliminada: " + imagenAnterior)
                        }
                    });
                }
                // Actualizar el nombre de la imagen con el nombre de la nueva imagen cargada
                imagenAnterior = req.file.filename;
            }

            personaAux.identificacion = req.body.identificacion;
            personaAux.tipo_identificacion = req.body.tipo_identificacion;
            personaAux.nombres = req.body.nombres;
            personaAux.apellidos = req.body.apellidos;
            personaAux.direccion = req.body.direccion;
            personaAux.estado = req.body.estado;
            cuentaAux.estado = req.body.estado;
            personaAux.foto = imagenAnterior;
            personaAux.external_id = uuid.v4();

            const result = await personaAux.save();
            await cuentaAux.save();
            if (!result) {
                return res.status(400).json({
                    msg: "No se han modificado sus datos",
                    code: 400
                });
            }

            return res.status(200).json({
                msg: "Se han modificado su datos!",
                code: 200
            });

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                msg: "Error en el servidor",
                code: 400
            });
        }
    }

    async asignarRol(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "Faltan datos",
                    code: 400,
                    errors: errors.array()
                });
            }
            const id_persona = req.body.external_persona;
            const id_rol = req.body.external_rol;

            var personaAux = await persona.findOne({
                where: {
                    external_id: id_persona
                }
            });

            var rolAux = await models.rol.findOne({
                where: {
                    external_id: id_rol
                }
            })
            if (!personaAux || !rolAux) {
                return res.status(400).json({
                    msg: "Persona o rol no existe",
                    code: 400
                })
            }
            const data = {
                id_persona: personaAux.id,
                id_rol: rolAux.id,

            };
            data.external_id = uuid.v4();
            const transaction = await models.sequelize.transaction();
            await models.persona_rol.create(data, { transaction });
            await transaction.commit();

            return res.status(200).json({
                msg: "Se ha asignado rol: " + rolAux.tipo + " a: " + personaAux.nombres,
                code: 200
            });
        } catch (error) {
            console.log(error)
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

    async listar(req, res) {
        try {
            var lista = await persona.findAll({
                attributes: [
                    'nombres',
                    'apellidos',
                    'external_id',
                    'direccion',
                    'identificacion',
                    'tipo_identificacion',
                    'fecha_nacimiento',
                    'telefono',
                    'estado',
                    'foto'
                ],
                include: [
                    {
                        model: models.persona_rol,
                        as: 'persona_rol',
                        attributes: [
                            'external_id'
                        ],
                        include: {
                            model: models.rol,
                            as: 'rol',
                            attributes: [
                                'tipo',
                                'external_id'
                            ],
                        }
                    },
                ],
            });

            return res.status(200).json({
                msg: 'OK!',
                code: 200,
                info: lista
            });

        } catch (error) {
            console.log(error)
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

    async obtener(req, res) {
        const external = req.params.external;
        var lista = await persona.findOne({
            where: {
                external_id: external
            },
            attributes: [
                'apellidos',
                'nombres',
                'external_id',
                'direccion',
                'identificacion',
                'tipo_identificacion',
                'fecha_nacimiento',
                'telefono',
                'direccion',
                'estado',
                'foto'
            ],
        });
        if (lista === null) {
            return res.status(400).json({
                msg: 'No existe esta persona',
                code: 400,
                info: listar
            });
        }
        return res.status(200).json({
            msg: 'OK!',
            code: 200,
            info: lista
        });
    }



}
module.exports = PersonaController;