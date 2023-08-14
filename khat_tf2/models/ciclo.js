'use strict';
module.exports = (sequelize, DataTypes) => {
    const ciclo = sequelize.define('ciclo', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        numero_ciclo: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false }
    }, { freezeTableName: true });
    ciclo.associate = function (models){
        ciclo.hasOne(models.asignatura, {foreignKey: 'id_ciclo',as:'asignatura'});
    }

    return ciclo;
};