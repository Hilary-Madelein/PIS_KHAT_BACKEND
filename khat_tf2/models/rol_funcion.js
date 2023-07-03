'use strict';
module.exports = (sequelize, DataTypes) => {
    const rol_funcion = sequelize.define('rol_funcion', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true });
    rol_funcion.associate = function (models) {
        rol_funcion.belongsTo(models.funcion, { foreignKey: 'id_funcion' });
        rol_funcion.belongsTo(models.rol, { foreignKey: 'id_rol' });
    }
    return rol_funcion;
};