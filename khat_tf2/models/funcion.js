'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const funcion = sequelize.define('funcion', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        nombre: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" }
    }, {
        freezeTableName: true
    });

    funcion.associate = function (models){
        funcion.belongsTo(models.grupo, {foreignKey: 'id_grupo'});
        funcion.hasOne(models.rol_funcion, { foreignKey: 'id_funcion', as: 'rol_funcion'});
    }

    return funcion;
};