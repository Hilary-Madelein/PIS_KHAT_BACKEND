'use strict';
module.exports = (sequelize, DataTypes) => {
    const entrega = sequelize.define('entrega', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        fecha_entrega: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        comentario: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        nota: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, allowNull: false },
        enlace_archivo_entrega: { type: DataTypes.STRING(350), defaultValue: "NO_DATA" },
    }, { freezeTableName: true });

    entrega.associate = function (models) {
        entrega.belongsTo(models.practica, { foreignKey: 'id_practica' });
        
    }

    return entrega;
};