'use strict';
var models = require('../models/');
var rol = models.rol;

class rolController{
    async listar(req, res){
        var lista = await rol.findAll({
            attributes: [
                'tipo', 
                'externalId', 
                'estado'
            ]
        });
        res.json({
            msg: "OK!",
            code: 200,
            info: lista
        })
    }
}
module.exports = rolController;