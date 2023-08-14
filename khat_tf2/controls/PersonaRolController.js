'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var rol = models.rol;
var cuenta = models.cuenta;
const bcypt = require('bcrypt');
const persona_rol = models.persona_rol;
const salRounds = 8;

class PersonaRolController {

    async listar(req, res) {
        const listaPersonas = await persona_rol.findAll({
            attributes: ['external_id'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'estado'],
                    include: {
                        model: cuenta,
                        as: 'cuenta',
                        attributes: ['correo']
                    }
                },
                {
                    model: rol,
                    as: 'rol',
                    attributes: ['tipo'],
                },
            ],
        });

        res.json({ msg: 'OK!', code: 200, info: listaPersonas });
    }
    async listar_docentes(req, res) {
        const listaDocentes = await persona_rol.findAll({
            attributes: ['external_id'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'telefono', 'estado'],
                    include: {
                        model: cuenta,
                        as: 'cuenta',
                        attributes: ['correo']
                    }
                },
                {
                    model: rol,
                    as: 'rol',
                    attributes: ['tipo'],
                    where: {
                        tipo: 'DOCENTE' 
                    }
                },
            ],
        });
    
        res.json({ msg: 'OK!', code: 200, info: listaDocentes });
    }
   
    async obtener_estudiante(req, res) {
        const cedula_estudiante = req.params.identificacion;
        const lista = await persona_rol.findOne({
            attributes: ['external_id'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['id', 'apellidos', 'nombres','external_id'],
                    where: {
                        estado: true,
                        identificacion: cedula_estudiante
                    }
                },
                {
                    model: rol,
                    as: 'rol',
                    attributes: ['tipo'],
                    where: {
                        tipo: 'ESTUDIANTE'                       
                    }
                },
            ],
        });
        if (!lista) {
            return res.status(400).json({
                msg: 'Estudiante no registrado en el sistema',
                code: 400
            });
        }
        
    
        res.json({ msg: 'OK!', code: 200, info: lista });
    }
}
module.exports = PersonaRolController;