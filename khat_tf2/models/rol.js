'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol = sequelize.define('rol', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        tipo: {type: DataTypes.STRING(20), defaultValue: "NO_DATA"}
    }, {freezeTableName: true});

    rol.associate = function (models) {
        rol.hasMany(models.persona_rol, {foreignKey: 'id_rol',as:'persona_rol'});
    }

    return rol;    
};