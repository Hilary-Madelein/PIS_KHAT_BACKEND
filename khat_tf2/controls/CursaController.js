'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var matricula = models.matricula;
var asignatura = models.asignatura;
var matricula = models.matricula;
var cursa = models.cursa;
var ciclo = models.ciclo;
var periodo = models.periodo;
var persona = models.persona;
const { Op } = require('sequelize');

class CursaController {
    async listar(req, res) {
        const listar = await cursa.findAll({
            attributes: ['estado', 'external_id', 'cedula_docente'],
            include: [
                {
                    model: asignatura,
                    as: 'asignatura',
                    attributes: ['external_id', 'estado', 'nombre'],
                    include: {
                        model: ciclo,
                        as: 'ciclo',
                        attributes: ['estado', 'numero_ciclo']
                    }
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
                        {
                            model: periodo,
                            as: 'periodo',
                            attributes: ['external_id', 'estado', 'comienzo', 'culminacion']
                        }
                    ]
                },
            ]
        });
        if (listar === null) {
            listar = {};
        }
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async listar_docentes(req, res) {
        try {
            const lista = await models.sequelize.query(
                'SELECT persona.id, persona.nombres, persona.apellidos, persona.identificacion, persona.tipo_identificacion, persona.external_id AS persona_external_id, persona.telefono, persona.fecha_nacimiento, persona.foto, persona.direccion, cursa.estado, cursa.external_id AS cursa_external_id FROM persona INNER JOIN cursa ON persona.identificacion = cursa.cedula_docente',
                { type: models.Sequelize.QueryTypes.SELECT }
            );

            if (lista.length === 0) {
                res.status(200).json({ msg: "No existen datos registrados", code: 200, info: lista });
            } else {
                res.status(200).json({ msg: "OK!", code: 200, info: lista });
            }
        } catch (error) {
            // Manejar el error si algo sale mal durante la consulta
            res.status(500).json({ msg: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    async obtener(req, res) {
        const external_id = req.params.external_id;
        var listar = await cursa.findOne({
            where: { external_id: external_id },
            attributes: ['estado', 'external_id', 'cedula_docente'],
            include: [
                {
                    model: asignatura,
                    as: 'asignatura',
                    attributes: ['external_id', 'estado', 'nombre'],
                    include: {
                        model: ciclo,
                        as: 'ciclo',
                        attributes: ['estado', 'numero_ciclo']
                    }
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
                        {
                            model: periodo,
                            as: 'periodo',
                            attributes: ['external_id', 'estado', 'comienzo', 'culminacion']
                        }
                    ]
                },
            ]
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async obtener_docente(req, res) {
        try {
            const external = req.params.external_id;

            const lista = await models.sequelize.query(
                'SELECT persona.id, persona.nombres, persona.apellidos, persona.identificacion, persona.tipo_identificacion, persona.external_id AS persona_external_id, persona.telefono, persona.fecha_nacimiento, persona.foto, persona.direccion, cursa.estado, cursa.external_id AS cursa_external_id FROM persona INNER JOIN cursa ON persona.identificacion = cursa.cedula_docente WHERE cursa.external_id = :external',
                {
                    replacements: { external },
                    type: models.Sequelize.QueryTypes.SELECT
                }
            );

            if (lista.length === 0) {
                res.status(200).json({ msg: "No existen datos registrados para el external_id proporcionado", code: 200, info: lista });
            } else {
                res.status(200).json({ msg: "OK!", code: 200, info: lista });
            }
        } catch (error) {
            // Manejar el error si algo sale mal durante la consulta
            res.status(500).json({ msg: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var matricula_id = req.body.external_matricula;
            var asignatura_id = req.body.external_asignatura;
            if (matricula_id != undefined && asignatura_id != undefined) {
                let matriculaAux = await matricula.findOne({ where: { external_id: matricula_id } });
                let asignaturaAux = await asignatura.findOne({ where: { external_id: asignatura_id } });
                if (matriculaAux && asignaturaAux) {
                    var data = {
                        cedula_docente: req.body.cedula_docente,
                        id_matricula: matriculaAux.id,
                        id_asignatura: asignaturaAux.id,
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await cursa.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "Matricula registrada con exito",
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
    async cambiar_estado(req, res) {
        var matri = await matricula.findOne({ where: { external_id: req.body.external_id } });
        if (matri === null) {
            res.status(400);
            res.json({
                msg: "No existen registros de la matricula",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            matri.estado = req.body.estado;
            matri.external_id = uuid.v4();
            var result = await matri.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "No se han modificado sus datos",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "Datos modificados correctamente",
                    code: 200
                });
            }
        }
    }
    async crear_cupos(req, res) {
        let errors = validationResult(req);
        var docente_cedula = req.body.cedula_docente;
        var asignatura_id = req.body.external_asignatura;
        var cupos = req.body.cupos;

        if (errors.isEmpty()) {
            if (docente_cedula != undefined && asignatura_id != undefined && cupos != undefined) {
                let asignaturaAux = await asignatura.findOne({ where: { external_id: asignatura_id } });

                if (asignaturaAux) {
                    var data = {
                        cedula_docente: docente_cedula,
                        id_asignatura: asignaturaAux.id,
                    };

                    let transaction = await models.sequelize.transaction();

                    for (let i = 0; i < cupos; i++) {
                        await cursa.create(data);
                    }

                    await transaction.commit();
                    res.json({
                        msg: "Docente asignados con éxito",
                        code: 200
                    });
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
    async obtener_asignatura(req, res) {
        try {
            const lista = await cursa.findAll({
                attributes: ['estado', 'external_id', 'cedula_docente', 'id_matricula'],
                include: [
                    {
                        model: asignatura,
                        as: 'asignatura',
                        attributes: ['external_id', 'estado', 'nombre'],
                    },
                ]
            });

            const filteredList = lista.filter(item => item.cedula_docente !== 'NO_DATA' && item.id_matricula === null);

            const asignaturasUnicas = {};

            filteredList.forEach(item => {
                const asignaturaNombre = item.asignatura.nombre;
                if (!asignaturasUnicas[asignaturaNombre]) {
                    asignaturasUnicas[asignaturaNombre] = item;
                }
            });

            const uniqueList = Object.values(asignaturasUnicas);

            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: uniqueList });
        } catch (error) {
            console.error(error);
            res.status(500);
            res.json({ msg: 'Error', code: 500 });
        }
    }
    async asignar_matricula(req, res) {
        try {
            let matriculaAux = await matricula.findOne({ where: { external_id: req.body.external_matricula } });
            var cur = await cursa.findOne({ where: { external_id: req.body.external_cursa } });
            console.log(req.body);
            if (cur === null) {
                res.status(400);
                res.json({
                    msg: "No existen registros",
                    code: 400
                });
            } else {
                var uuid = require('uuid');
                cur.id_matricula = matriculaAux.id;
                cur.external_id = uuid.v4();
                var result = await cur.save();
                if (result === null) {
                    res.status(400);
                    res.json({
                        msg: "No se ha asignado matricula",
                        code: 400
                    });
                } else {
                    res.status(200);
                    res.json({
                        msg: "Matricula asignada con éxito",
                        code: 200
                    });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500);
            res.json({ msg: 'Error', code: 500 });
        }
    }
    async obtener_listado_estudiantes(req, res) {
        const asignatura_id = req.body.id_asignatura;
        const docente_cedula = req.body.docente_cedula;
        var listar = await cursa.findAll({
            where: {
                id_asignatura: asignatura_id,
                cedula_docente: docente_cedula,
               id_matricula: { [Op.not]: null }
            },
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
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async obtener_asignaturas_estudiantes(req, res) {
        console.log("lj");
        const persona_id = req.params.id_persona;
        console.log(req);
        var mensaje='OK!';
        let matriculaAux = await matricula.findOne({ where: { id_persona: persona_id } });
        if (matriculaAux === null) {
           mensaje = "No se encuentra matriculado";
        } else {
            console.log(matriculaAux);
            var cursa_asig = await cursa.findOne({ where: { id_matricula: matriculaAux.id } });
            console.log("hhhhhh " + cursa_asig);
            if (cursa_asig === null) {
                listar = {};
                mensaje= "No tiene asignaturas asignadas";
            } else {
                var listar = await cursa.findAll({
                    where: {
                        id_matricula: cursa_asig.id_matricula
                    },
                    attributes: ['estado', 'external_id', 'cedula_docente', 'id_asignatura'],
                    include: [
                        {
                            model: asignatura,
                            as: 'asignatura',
                            attributes: ['external_id', 'estado', 'nombre'],
                        },
                    ]
                });
            }
        }
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: mensaje, code: 200, info: listar });
    }
    async obtener_asignaturas_docente(req, res) {
        const docente_cedula = req.params.cedula_docente;
    
        try {
            const lista = await cursa.findAll({
                where: {
                    cedula_docente: docente_cedula
                },
                attributes: ['estado', 'external_id', 'cedula_docente', 'id_matricula'],
                include: [
                    {
                        model: asignatura,
                        as: 'asignatura',
                        attributes: ['external_id', 'estado', 'nombre'],
                    },
                ]
            });
    
            const asignaturasUnicas = [];
            const asignaturasFiltradas = lista.filter(item => {
                if (!asignaturasUnicas.includes(item.asignatura.nombre)) {
                    asignaturasUnicas.push(item.asignatura.nombre);
                    return true;
                }
                return false;
            });
    
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: asignaturasFiltradas });
        } catch (error) {
            console.error(error);
            res.status(500);
            res.json({ msg: 'Error', code: 500 });
        }
    }
    async obtener_cursa(req, res) {
        const person_id = req.body.persona_id;
        const asig_external = req.body.asignatura_external;
        let personaAux = await persona.findOne({ where: { id: person_id } });
        let matriculaAux = await matricula.findOne({ where: { id_persona: personaAux.id } });
        let asignaturaAux = await asignatura.findOne({ where: { external_id: asig_external } });

        var listar = await cursa.findAll({
            where: { 
                id_asignatura: asignaturaAux.id,
                id_matricula: matriculaAux.id
            },
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
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
}
module.exports = CursaController;