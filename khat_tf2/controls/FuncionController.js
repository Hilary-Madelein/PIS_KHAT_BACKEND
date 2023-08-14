'use strict'
var models = require('../models');
var funcion = models.funcion

const { validationResult } = require('express-validator');

class FuncionController {
    async guardar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }

            const data = {
                nombre: req.body.nombreFuncion
            };

            const uuid = require('uuid');
            data.externalId = uuid.v4();

            const transaction = await models.sequelize.transaction();

            await funcion.create(data, { transaction });

            await transaction.commit();

            return res.status(200).json({
                msg: "SE HA REGISTRADO LA FUNCIÓN",
                code: 200
            });

        } catch (error) {
            console.log(error)
            if (error.errors && error.errors[0].message) {
                return res.status(400).json({
                    msg: error.errors[0].message,
                    code: 400
                });
            } else {
                return res.status(400).json({
                    msg: "Ha ocurrido un error en el servidor",
                    code: 400
                });
            }
        }
    }
}
module.exports = FuncionController;