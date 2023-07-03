'use strict';
module.exports = (sequelize, DataTypes) => {
    const practica = sequelize.define('practica', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        nombre: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        fecha_habilitada:{type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        fecha_entrega:{type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        external_id_cursa:  { type: DataTypes.STRING(150), defaultValue: "NO_DATA" },
    }, {
        freezeTableName: true
    });

    practica.associate = function (models){
        practica.hasOne(models.entrega, { foreignKey: 'id_practica', as: 'entrega'});
    }

    return practica;
};