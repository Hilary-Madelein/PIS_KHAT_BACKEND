'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const grupo = sequelize.define('grupo', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        nombre_grupo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA"},
    }, {
        freezeTableName: true
    });
  
    grupo.associate = function (models){
        grupo.hasMany(models.funcion, {foreignKey: 'id_grupo',as:"funcion"});
    }

    return grupo;
};