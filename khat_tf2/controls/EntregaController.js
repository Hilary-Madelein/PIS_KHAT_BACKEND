'use strict';
const { authPlugins } = require('mysql2');
var models = require('../models');
var practica = models.practica;
var entrega=models.entrega;

const { validationResult } = require('express-validator');
class EntregaController {

    async entregar_practica(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var practica_external = req.body.external_practica;
            if (practica_external != undefined) {
                let practicaux = await practica.findOne({ where: { external_id: practica_external } });
                if (practicaux) {
                    var data = {
                        comentario: req.body.comentario,
                        enlace_archivo_entrega: req.file.filename,
                        id_practica: practicaux.id,

                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        practicaux.estado=false;
                        await practicaux.save();
                        await entrega.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "Practica entregada con éxito",
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
            res.json({ msg: "Datos no encontrados", code: 400 });
        }
    }

    async obtener_entregas(req, res) {
        const practica_external = req.params.external;
        let practicaAux = await practica.findOne({ where: { external_id: practica_external } });
        var listar = await entrega.findAll({
            where: { id_practica:   practicaAux.id },
            attributes: ['external_id', 'estado', 'fecha_entrega', 'comentario', 'nota', 'enlace_archivo_entrega']
        });
        if (listar == null) {
            listar = {}
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener_entregas_docente(req, res) {
        const practica_external = req.params.external_practica;
        let practicaAux = await practica.findOne({ where: { external_id: practica_external } });
        var listar = await entrega.findAll({
            where: { id_practica: practicaAux.id },
            attributes: ['external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'id_cursa'],
            include: {
                model: practica,
                as: "practica",
                attributes:['external_id', 'estado', 'nombre', 'comentario', 'fecha_entrega', 'external_nota'],
            }
        });
        if (listar == null) {
            listar = {}
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async calificar(req, res) {
        var aux = await entrega.findOne({ where: { external_id: req.body.external_id } });
        if (aux === null) {
            res.status(400);
            res.json({ msg: "NO EXISTEN REGISTROS", code: 400 });
        } else {
            var uuid = require('uuid');
            aux.estado = false;
            aux.nota = req.body.nota;
            aux.external_id = uuid.v4();
            var result = await aux.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: "Práctica no calificada", code: 400 });
            } else {
                res.status(200);
                res.json({ msg: "Práctica calificada con éxito", code: 200 });
            }
        }
    }
}
module.exports = EntregaController;