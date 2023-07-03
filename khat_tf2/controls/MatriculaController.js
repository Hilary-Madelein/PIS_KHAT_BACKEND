'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const periodo = models.periodo;
var persona = models.persona;
var matricula = models.matricula;

class MatriculaController {

    async listar(req, res) {
        const listaMatriculas = await matricula.findAll({
            attributes: ['numero', 'estado', 'external_id', 'fecha_registro'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion']
                },
                {
                    model: periodo,
                    as: 'periodo',
                    attributes: ['external_id', 'estado', 'mes_comienzo', 'mes_culminacion', 'anio_periodo']
                }
            ]
        });

        res.json({ msg: 'OK!', code: 200, info: listaMatriculas });
    }


    async obtener(req, res) {
        const external = req.params.external;
        var listar = await matricula.findOne({
            where: { external_id: external },
            attributes: ['numero', 'estado', 'external_id', 'fecha_registro'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion']
                },
                {
                    model: periodo,
                    as: 'periodo',
                    attributes: ['external_id', 'estado', 'mes_comienzo', 'mes_culminacion', 'anio_periodo']
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
                console.log("PPP", periodoAux);
                if (personaAux && periodoAux) {
                    var data = {
                        numero: req.body.numero,
                        estado: req.body.estado,
                        fecha_registro: req.body.fecha_ingreso,
                        id_persona: personaAux.id,
                        id_periodo: periodoAux.id
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await matricula.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "MATRICULA REGISTRADA CON EXITO",
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
        var matri = await matricula.findOne({ where: { external_id: req.body.external } });
        if (matri === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            matri.estado = req.body.estado;
            matri.fecha_registro = req.body.fecha_registro;
            matri.apellidos = req.body.apellidos;
            matri.external_id = uuid.v4();
            var result = await matri.save();
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
}
module.exports = MatriculaController;