module.exports = (sequelize, DataTypes) => {
    const periodo = sequelize.define('periodo', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        mes_comienzo:{type: DataTypes.STRING(15), defaultValue: "NO_DATA"},
        mes_culminacion:{type: DataTypes.STRING(15), defaultValue: "NO_DATA"},
        anio_periodo: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false }
    }, {
        freezeTableName: true
    });

    periodo.associate = function (models){
        periodo.hasOne(models.matricula, {foreignKey: 'id_periodo',as:'matricula'});
    }

    return periodo;
};