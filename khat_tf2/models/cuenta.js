'use strict';
module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta', {
        correo: {
            type: DataTypes.STRING(20),
            unique: true,
            defaultValue: null
        },
        clave: {
          type: DataTypes.STRING(60),
          unique: true,
          defaultValue: 'defaultclave'  
        },
        externalId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, //tiene 36 caracteres
            unique: true,
        },
        estado: {
            type: DataTypes.BOOLEAN, 
            defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {freezeTableNAme: true});

    cuenta.associate = function(models){
        cuenta.belongsTo(models.persona, {foreignKey: 'id_persona'});
    }

    return cuenta;
}