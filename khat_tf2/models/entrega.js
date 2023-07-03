'use strict';
module.exports = (sequelize, DataTypes) => {
    const entrega = sequelize.define('entrega', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        estudiante:  { type: DataTypes.STRING(15), defaultValue: "NO_DATA" },//la cedula
        nombre: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        fecha_entrega:{type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        comentario: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        nota: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, allowNull: false }
    }, {
        freezeTableName: true
    });

    entrega.associate = function (models){
      entrega.belongsTo(models.practica, {foreignKey: 'id_practica'});
    }

    return entrega;
};
