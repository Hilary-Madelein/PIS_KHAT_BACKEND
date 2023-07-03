'use strict';
const { authPlugins } = require('mysql2');
var models = require('../models/');
var asignatura = models.asignatura;
var ciclo = models.ciclo;

const { validationResult } = require('express-validator');
class AsignaturaController {

    async listar(req, res) {
        var listar = await asignatura.findAll({
            attributes: ['external_id', 'estado', 'nombre'],
            include: {
                model: ciclo,
                as: 'ciclo',
                attributes: ['estado', 'numero_ciclo']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await asignatura.findOne({
            where: { external_id: external}, include: { model: ciclo, as: 'ciclo', attributes: ['estado', 'numero_ciclo']},
            attributes: ['external_id', 'estado', 'nombre'],
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
            var ciclo_id = req.body.external_ciclo;
            if (ciclo_id != undefined) {
                
                let cicloAux = await ciclo.findOne({ where: { external_id: ciclo_id } });
                console.log("cccc", cicloAux.id);
                if (cicloAux) {
                    var data = {
                        nombre: req.body.nombre,
                        id_ciclo: cicloAux.id
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await asignatura.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "ASIGNATURA REGISTRADA CON EXITO",
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
        console.log("-----",req);
        var auth = await asignatura.findOne({ where: { external_id: req.body.external_id } }); 
        console.log(auth);
        if (auth === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            auth.estado = req.body.estado;
            auth.external_id = uuid.v4();
            var result = await auth.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HA MODIFICADO EL ESATDO DE LA ASIGNATURA",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HA CAMBIADO DE ESTADO CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }

}
module.exports = AsignaturaController;