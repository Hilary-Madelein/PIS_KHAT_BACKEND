'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const periodo = models.periodo;
var persona = models.persona;
var matricula = models.matricula;

class MatriculaController {

    async listar(req, res) {
        const listar = await matricula.findAll({
            attributes: ['numero', 'estado', 'external_id', 'fecha_registro'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion', 'foto']
                },
                {
                    model: periodo,
                    as: 'periodo',
                    attributes: ['external_id', 'estado', 'comienzo', 'culminacion']
                }
            ]
        });
        if (listar === null) {
            listar = {};
        }

        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external_id = req.body.external_id;
        var listar = await matricula.findOne({
            where: { external_id: external_id},
            attributes: ['numero', 'estado', 'external_id', 'fecha_registro'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion','foto']
                },
                {
                    model: periodo,
                    as: 'periodo',
                    attributes: ['external_id', 'estado', 'comienzo', 'culminacion']
                }
            ]
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var persona_id = req.body.external_persona;
            var periodo_id = req.body.external_periodo;
            if (persona_id != undefined && periodo_id != undefined) {
                let personaAux = await persona.findOne({ where: { external_id: persona_id } });
                let periodoAux = await periodo.findOne({ where: { external_id: periodo_id } });
                if (personaAux && periodoAux) {
                    const maxNumeroMatricula = await matricula.max('id');
                    var data = {
                        id_persona: personaAux.id,
                        id_periodo: periodoAux.id,
                        numero: (maxNumeroMatricula+1)+"-"+periodoAux.id+"-"+personaAux.identificacion
                    }
                    console.log(data.numero);
                   let transaction = await models.sequelize.transaction();
                    try {
                       var mar= await matricula.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "Matricula registrada con exito",
                            code: 200,
                            info:{matricula:mar.external_id}
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

    async cambiar_estado(req, res) {
        var matri = await matricula.findOne({where:{external_id: req.body.external_id}});
        if (matri === null) {
            res.status(400);
            res.json({
                msg: "No existen registros de la matricula",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            matri.estado = req.body.estado;
            matri.external_id = uuid.v4();
            var result = await matri.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "No se han modificado sus datos",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "Datos modificados correctamente",
                    code: 200
                });
            }
        }
    }
}
module.exports = MatriculaController;