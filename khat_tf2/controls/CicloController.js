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
        const external_id = req.body.external_id;
        var listar = await ciclo.findOne({
            where: { external_id: external_id},
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
                    msg: "Se han registrado los datos del ciclo",
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

}
module.exports = CicloController;