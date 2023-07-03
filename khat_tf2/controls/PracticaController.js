'use strict';
const { authPlugins } = require('mysql2');
var models = require('../models/');
var practica = models.practica;

const { validationResult } = require('express-validator');
class PracticaController {

    async listar(req, res) {
        var listar = await practica.findAll({
            attributes: ['external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'external_id_cursa'],
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await practica.findOne({
            where: { external_id: external},
            attributes: ['external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'external_id_cursa'],
        });
        if (listar == null) {
            listar = {}
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    
    async guardar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "DATOS INCOMPLETOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            
            const data = {
                nombre: req.body.nombre,
                fecha_habilitada: req.body.fecha_habilitada,
                fecha_entrega: req.body.fecha_entrega,
                external_id_cursa: req.body.external_id_cursa
            };

            const uuid = require('uuid');
            data.external_id = uuid.v4();
    
            const transaction = await models.sequelize.transaction();
    
            /**const [ciclo] = await models.ciclo.findOrCreate({
                where: { 
                    numero_ciclo: data.ciclo.numero_ciclo
                },
                transaction
            });
                        data.id_ciclo = ciclo.id; */
    
            await practica.create(data, { 
                transaction 
            });

            await transaction.commit();
    
            return res.status(200).json({
                msg: "PRACTICA REGISTRADA CON EXITO",
                code: 200
            });
        } catch (error) {
            if (error.errors && error.errors[0].message) {
                return res.status(200).json({
                    msg: error.errors[0].message,
                    code: 200
                });
            } else {
                return res.status(400).json({
                    msg: "error en el servidor",
                    code: 400
                });
            }
        }
    }

    async modificar(req, res) {
        console.log("-----",req);
        var auth = await practica.findOne({ where: { external_id: req.body.external_id } }); 
        console.log(auth);
        if (auth === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            auth.nombre = req.body.nombre;
            auth.fecha_entrega = req.body.fecha_entrega;
            auth.external_id = uuid.v4();
            var result = await auth.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HA MODIFICADO LA PRACTICA",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HA MODFICADO LA PRACTICA CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
}
module.exports = PracticaController;