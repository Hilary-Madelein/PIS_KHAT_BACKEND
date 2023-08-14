'use strict';
module.exports = (sequelize, DataTypes) => {
    const matricula = sequelize.define('matricula', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        numero:  { type: DataTypes.STRING(100), defaultValue: "NO_DATA",unique: true},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        fecha_registro:{type: DataTypes.DATE, defaultValue: DataTypes.NOW}
    }, {freezeTableName: true});
  
    matricula.associate = function (models) {
        matricula.belongsTo(models.persona, {foreignKey: 'id_persona'});
        matricula.belongsTo(models.periodo, {foreignKey: 'id_periodo'});
        matricula.hasMany(models.cursa, {foreignKey: 'id_matricula',as:"cursa"});
    }

    return matricula;    
};