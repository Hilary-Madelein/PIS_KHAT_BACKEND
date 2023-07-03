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


}
module.exports = PersonaRolController;