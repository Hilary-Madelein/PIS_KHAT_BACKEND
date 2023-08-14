'use strict';
const { authPlugins } = require('mysql2');
var models = require('../models/');
var practica = models.practica;
const axios = require('axios');
const fs = require('fs');
var asignatura = models.asignatura;
var matricula = models.matricula;
var cursa = models.cursa;
var persona = models.persona;
var entrega = models.entrega;
const { Op } = require('sequelize');

const { validationResult } = require('express-validator');
class PracticaController {

    async listars(req, res) {
        var listar = await practica.findAll({
            attributes: ['external_id', 'estado', 'nombre', 'comentario', 'fecha_entrega', 'external_nota'],
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listar(req, res) {
        var listar = await models.sequelize.query(
            'SELECT practica.comentario, practica.external_id, practica.fecha_entrega, practica.nombre AS practica_nombre, asignatura.nombre FROM practica INNER JOIN asignatura ON practica.external_nota = asignatura.external_id WHERE practica.estado = :estado',
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
            attributes: ['external_id', 'estado', 'nombre', 'comentario', 'fecha_entrega', 'nota'],
        });
        if (listar == null) {
            listar = {}
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        console.log("aqui estoy");
        let errors = validationResult(req);
        //  console.log(req);
        if (errors.isEmpty()) {
            var cursa_external = req.body.external_cursa;
            // console.log(req.file);
            if (cursa_external != undefined) {
                let cursaAux = await cursa.findOne({ where: { external_id: cursa_external } });
                if (cursaAux) {
                    var data = {
                        'nombre': req.body.nombre,
                        'fecha_entrega': req.body.fecha_entrega,
                        'fecha_habilitada': req.body.fecha_habilitada,
                        'enlace_archivo': null,
                        'laboratorio': req.body.laboratorio,
                        'id_cursa': cursaAux.id,
                    }
                    if (req.file) {
                        data.enlace_archivo = req.file.filename;
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await practica.create(data, transaction);
                        await transaction.commit();
                        res.json({
                            msg: "Practica asignada con éxito",
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

    async listar_practicas(req, res) {
        const cursa_external = req.params.external_cursa;
        try {
            let cursaAux = await cursa.findOne({ where: { external_id: cursa_external } });
            if (!cursaAux) {
                cursaAux = {};
            }

            const listar = await practica.findAll({
                where: { id_cursa: cursaAux.id },
                attributes: ['id', 'external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'enlace_archivo', 'laboratorio'],
                include: {
                    model: cursa,
                    as: 'cursa',
                    attributes: ['estado', 'external_id', 'cedula_docente', 'id_asignatura'],
                    include: [
                        {
                            model: asignatura,
                            as: 'asignatura',
                            attributes: ['external_id', 'estado', 'nombre'],
                        },
                        {
                            model: matricula,
                            as: 'matricula',
                            attributes: ['numero', 'estado', 'external_id', 'fecha_registro'],
                            include: [
                                {
                                    model: persona,
                                    as: 'persona',
                                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion', 'foto']
                                },
                            ]
                        },
                    ]
                }
            });

            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            console.error(error);
            res.status(500);
            res.json({ msg: 'Internal Server Error', code: 500 });
        }
    }
    async listar_practicas_entregadas(req, res) {
        const cursa_external = req.params.external;
        console.log(req.params);
        try {
            let cursaAux = await cursa.findOne({ where: { external_id: cursa_external } });
            if (!cursaAux) {
                cursaAux = {};
            }

            const listar = await practica.findAll({
                where: { id_cursa: cursaAux.id },
                attributes: ['id', 'external_id', 'estado', 'nombre', 'fecha_habilitada', 'fecha_entrega', 'enlace_archivo', 'laboratorio'],
                include: {
                    model: cursa,
                    as: 'cursa',
                    attributes: ['estado', 'external_id', 'cedula_docente', 'id_asignatura'],
                    include: [
                        {
                            model: asignatura,
                            as: 'asignatura',
                            attributes: ['external_id', 'estado', 'nombre'],
                        },
                        {
                            model: matricula,
                            as: 'matricula',
                            attributes: ['numero', 'estado', 'external_id', 'fecha_registro'],
                            include: [
                                {
                                    model: persona,
                                    as: 'persona',
                                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'direccion', 'foto']
                                },
                            ]
                        },
                    ]
                }
            });

            const listar2 = await entrega.findAll({
                where: { id_practica: listar.map(item => item.id) }, // Usamos .map() para obtener un array de ids
                attributes: ['external_id', 'estado', 'fecha_entrega', 'comentario', 'enlace_archivo_entrega'],
            });
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar2 });

        } catch (error) {
            console.error(error);
            res.status(500);
            res.json({ msg: 'Internal Server Error', code: 500 });
        }
    }
    async modificar(req, res) {
        var auth = await entrega.findOne({ where: { external_id: req.body.external_id } });
        console.log(auth);
        if (auth === null) {
            res.status(400);
            res.json({ msg: "No existe registro", code: 400 });
        } else {
            var uuid = require('uuid');
            auth.nombre = req.body.nombre;
            auth.fecha_entrega = req.body.fecha_entrega;
            auth.enlace_archivo_entrega = req.file.filename,
                auth.external_id = uuid.v4();
            var result = await auth.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: "No se ha modificado la practica", code: 400 });
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

    async listarCodigos(req, res) {
        try {
            // Realizar la solicitud GET al servidor externo
            const response = await axios.get('http://10.20.202.112/laboratorio?comando=' + req.params.comando);

            // Si el servidor responde con éxito
            if (response.status === 200) {
                // Obtener los datos de la respuesta del servidor
                const listar = response.data;

                // Acceder a la propiedad 'aux' y decodificarla de base64 a texto
                const auxBase64 = listar.info[0].aux;
                const auxTiempos = listar.info[0].tiempo;
                const auxTexto = Buffer.from(auxBase64, 'base64').toString('utf-8');

                // Responder con los datos obtenidos
                res.json({ msg: listar.msg, code: listar.code, info: auxTexto });
            } else {
                // Si la respuesta del servidor no es 200
                res.json({ msg: "Error al realizar la solicitud al servidor externo", code: response.status, info: [] });
            }
        } catch (error) {
            // Resto del código para manejar errores...
            console.log(error);
            res.json({ msg: "Error al realizar la solicitud al servidor externo", code: response.status, error: error, info: [] });
        }
    }

}
module.exports = PracticaController;