'use strict';

var models = require('../models/');
var rol = models.rol;

class RolController{
    async listar(req,res){
        console.log("YYY");
        var listar= await rol.findAll({
            attributes:['tipo','external_id','estado']
        });
        console.log("SI", listar);
        res.json({msg:'OK!',code:200,info:listar});
    }
}

module.exports = RolController;