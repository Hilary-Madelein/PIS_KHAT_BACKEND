'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol = sequelize.define('rol',{
        tipo: {
            type: DataTypes.ENUM("administrador", "usuario"),
        },
        estado: {
            type: DataTypes.BOOLEAN, 
            defaultValue: true
        },
        externalId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, //tiene 36 caracteres
            unique: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {freezeTableName: true});
    
    rol.associate = function (models) {
        rol.hasMany(models.persona, {foreignKey: 'id_rol', as: 'persona'});
    }
    return rol;
};