'use strict';
const { authPlugins } = require('mysql2');
var models = require('../models/');
var practica = models.practica;

const { validationResult } = require('express-validator');
class PracticaController {

    /* async listar(req, res) {
         var listar = await practica.findAll({
             attributes: ['external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'external_id_cursa'],
         });
         res.json({ msg: 'OK!', code: 200, info: listar });
     }
    async listar(req, res) {
        var listar = await models.sequelize.query(
            'SELECT practica.fecha_habilitada, practica.external_id , practica.fecha_entrega, practica.nombre AS practica_nombre, asignatura.nombre FROM practica INNER JOIN asignatura ON practica.external_id_cursa = asignatura.external_id',
            {
                replacements: { external_id: req.params.external },
                type: models.Sequelize.QueryTypes.SELECT
            }
        );

        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });

    }*/
    async listar(req, res) {
        var listar = await models.sequelize.query(
            'SELECT practica.fecha_habilitada, practica.external_id, practica.fecha_entrega, practica.nombre AS practica_nombre, asignatura.nombre FROM practica INNER JOIN asignatura ON practica.external_id_cursa = asignatura.external_id WHERE practica.estado = :estado',
            {
                replacements: { external_id: req.params.external, estado: true },
                type: models.Sequelize.QueryTypes.SELECT
            }
        );
    
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await practica.findOne({
            where: { external_id: external },
            attributes: ['external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'external_id_cursa'],
        });
        if (listar == null) {
            listar = {}
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var data = {
                nombre: req.body.nombre,
                fecha_entrega: req.body.fecha_entrega,
                external_id_cursa: req.body.external_id_cursa
            }
            let transaction = await models.sequelize.transaction();
            try {
                await practica.create(data);
                await transaction.commit();
                res.json({
                    msg: "Practica asignada",
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
        var auth = await practica.findOne({ where: { external_id: req.body.external_id } });
        console.log(auth);
        if (auth === null) {
            res.status(400);
            res.json({ msg: "NO EXISTEN REGISTROS", code: 400 });
        } else {
            var uuid = require('uuid');
            auth.nombre = req.body.nombre;
            auth.fecha_entrega = req.body.fecha_entrega;
            auth.external_id = uuid.v4();
            var result = await auth.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: "NO SE HA MODIFICADO LA PRACTICA", code: 400 });
            } else {
                res.status(200);
                res.json({ msg: "SE HA MODFICADO LA PRACTICA CORRECTAMENTE", code: 200 });
            }
        }
    }

    async cambiarEstado(req, res) {
        var aux = await practica.findOne({ where: { external_id: req.body.external_id } });
        if (aux === null) {
            res.status(400);
            res.json({ msg: "NO EXISTEN REGISTROS", code: 400 });
        } else {
            var uuid = require('uuid');
            aux.estado = false;
            aux.external_id = uuid.v4();
            var result = await aux.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: "NO SE HA MODIFICADO EL ESTADO", code: 400 });
            } else {
                res.status(200);
                res.json({ msg: "CAMBIO DE ESTADO EXITOSO", code: 200 });
            }
        }
    }
}
module.exports = PracticaController;