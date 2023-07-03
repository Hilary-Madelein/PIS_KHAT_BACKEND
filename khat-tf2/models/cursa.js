'use strict';
module.exports = (sequelize, DataTypes) => {
    const cursa = sequelize.define('cursa', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        paralelo: { type: DataTypes.STRING(5), defaultValue: "A" },        
    }, {freezeTableName: true});
    cursa.associate = function (models){
        cursa.belongsTo(models.matricula, {foreignKey: 'id_matricula'});
        cursa.belongsTo(models.asignatura, {foreignKey: 'id_asignatura'});
    }

    return cursa;
};