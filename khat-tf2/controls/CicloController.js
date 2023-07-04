'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const ciclo = models.ciclo;

class CicloController {

    async listar(req, res) {
        var listar = await ciclo.findAll({
            attributes: ['external_id', 'estado', 'numero_ciclo']
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await ciclo.findOne({
            where: { external_id: external },
            attributes: ['external_id', 'estado', 'numero_ciclo'],
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
                numero_ciclo: req.body.numero_ciclo
            }
            let transaction = await models.sequelize.transaction();
            try {
                await ciclo.create(data);
                await transaction.commit();
                res.json({
                    msg: "SE HAN REGISTRADO LOS DATOS DEL CICLO",
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
        var cil = await ciclo.findOne({ where: { external_id: req.body.external } });
        if (cil === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            cil.numero_ciclo = req.body.numero_ciclo;
            cil.external_id = uuid.v4();
            var result = await per.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO LOS DATOS DEL CICLO",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO LOS DATOS DEL CICLO CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
}
module.exports = CicloController;