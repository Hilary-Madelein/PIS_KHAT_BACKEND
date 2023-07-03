'use strict';
module.exports = (sequelize, DataTypes) => {
    const persona_rol = sequelize.define('persona_rol', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: {type: DataTypes.BOOLEAN, defaultValue: true}
    }, {freezeTableName: true});

    persona_rol.associate = function (models) {
        persona_rol.belongsTo(models.rol, {foreignKey: 'id_rol'});
        persona_rol.belongsTo(models.persona, {foreignKey: 'id_persona'});
    }

    return persona_rol;    
};