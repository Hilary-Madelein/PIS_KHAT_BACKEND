'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const periodo = models.periodo;

class PeriodoController {

    async listar(req, res) {
        var listar = await periodo.findAll({
            attributes: ['external_id', 'estado', 'comienzo', 'culminacion']
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listar_activo(req, res) {
        var listar = await periodo.findAll({
            where: { estado: true },
            attributes: ['external_id', 'comienzo', 'culminacion']
        });
        if (listar === null) {
            listar = {};
        }
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listar_desactivo(req, res) {
        var listar = await periodo.findAll({
            where: { estado: false },
            attributes: ['external_id', 'comienzo', 'culminacion']
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external_id = req.body.external_id;
        var listar = await periodo.findOne({
            where: { external_id: external_id},
            attributes: ['external_id', 'estado', 'comienzo', 'culminacion'],
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);
        console.log('SSS', errors);
        if (errors.isEmpty()) {
            var data = {
                comienzo: req.body.comienzo,
                culminacion: req.body.culminacion
            }
            let transaction = await models.sequelize.transaction();
            try {
                await periodo.create(data);
                await transaction.commit();
                res.json({
                    msg: "Se han registrado los datos del periodo",
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
            if (errors.errors && errors.errors[0].msg) {
                res.json({ msg: errors.errors[0].msg, code: 200 });
            } else {
                res.json({ msg: errors.errors[1].msg, code: 200 });
            }
        }
    }

    async cambiarEstado(req, res) {
        var peri = await periodo.findOne({ where: { external_id: req.body.external_id} });
        if (peri === null) {
            res.status(400);
            res.json({
                msg: "No existe registro del periodo",
                code: 400 
            });  
        } else { 
            var uuid = require('uuid');
            peri.estado = req.body.estado;
            peri.external_id = uuid.v4();
            var result = await peri.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "No se ha modificado el estado del periodo",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "Se ha cambiado el estado del periodo con exito",
                    code: 200
                });
            }
        }
    }
  
}
module.exports = PeriodoController;