module.exports = (sequelize, DataTypes) => {
    const periodo = sequelize.define('periodo', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        comienzo:{type: DataTypes.DATE},
        culminacion:{type: DataTypes.DATE}
    }, { freezeTableName: true });

    periodo.associate = function (models){
        periodo.hasOne(models.matricula, {foreignKey: 'id_periodo',as:'matricula'});
    }

    return periodo;
};