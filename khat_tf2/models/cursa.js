'use strict';
module.exports = (sequelize, DataTypes) => {
    const cursa = sequelize.define('cursa', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},   
        cedula_docente:{type: DataTypes.STRING(15), defaultValue: "NO_DATA"}
    }, {freezeTableName: true});
    cursa.associate = function (models){
        cursa.belongsTo(models.matricula, {foreignKey: 'id_matricula'});
        cursa.belongsTo(models.asignatura, {foreignKey: 'id_asignatura'});
        cursa.hasMany(models.practica, {foreignKey: 'id_cursa',as:"practica"});
    }

    return cursa;
};