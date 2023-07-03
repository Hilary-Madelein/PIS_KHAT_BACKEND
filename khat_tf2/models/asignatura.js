'use strict';
module.exports = (sequelize, DataTypes) => {
    const asignatura = sequelize.define('asignatura', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        nombre:{type: DataTypes.STRING(80), defaultValue: "NO_DATA"}
    }, {freezeTableName: true });
    asignatura.associate = function (models){
        asignatura.hasMany(models.cursa, {foreignKey: 'id_asignatura',as:'cursa'});
        asignatura.belongsTo(models.ciclo, {foreignKey: 'id_ciclo'});
    }

    return asignatura;
};