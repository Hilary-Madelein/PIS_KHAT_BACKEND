'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const periodo = models.periodo;

class PeriodoController {

    async listar(req, res) {
        var listar = await periodo.findAll({
            attributes: ['external_id', 'estado', 'mes_comienzo', 'mes_culminacion', 'anio_periodo']
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await periodo.findOne({
            where: { external_id: external },
            attributes: ['external_id', 'estado', 'mes_comienzo', 'mes_culminacion', 'anio_periodo'],
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
            var data = {
                mes_culminacion: req.body.mes_culminacion,
                mes_comienzo: req.body.mes_comienzo,
                anio_periodo: req.body.anio_periodo
            }
            let transaction = await models.sequelize.transaction();
            try {
                await periodo.create(data);
                await transaction.commit();
                res.json({
                    msg: "SE HAN REGISTRADO LOS DATOS DEL PERIODO",
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
    }

    async modificar(req, res) {
        var per = await periodo.findOne({ where: { external_id: req.body.external } });
        if (per === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            per.mes_comienzo = req.body.mes_comienzo;
            per.mes_culminacion = req.body.mes_culminacion;
            per.anio_periodo = req.body.anio_periodo;
            per.external_id = uuid.v4();
            var result = await per.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO LOS DATOS DEL PERIODO",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO LOS DATOS DEL PERIODO CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
}
module.exports = PeriodoController;