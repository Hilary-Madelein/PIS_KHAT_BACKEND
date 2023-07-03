module.exports = (sequelize, DataTypes) => {
    const persona = sequelize.define('persona', {
        nombres: DataTypes.STRING(20),
        apellidos: DataTypes.STRING(20),
        direccion: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        tipo_Identificacion:{
            type: DataTypes.ENUM("cedula", "pasaporte", "ruc"),
            defaultValue: "cedula",
        },
        identificacion: {
            type: DataTypes.STRING(10),
            unique: true,
            validate: {
                esUnicaIdentificacion: function (tipoIdentificacion, next) {
                    const estaPersona = this;

                    if (!/^\d+$/.test(tipoIdentificacion)) {
                        return next("La identificación debe contener solo números");
                    }
                    persona.findOne({ 
                        where: { 
                            identificacion: tipoIdentificacion 
                        }}).then(
                            function (persona) {
                                if (persona && estaPersona.id !== persona.id) {
                                    return next("La identificación " + { tipoIdentificacion } + " ya está siendo utilizada por otra persona");
                                }
                                return next();
                            }).catch(
                                function (err) {
                                return next(err);
                            });
                }
            }
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
    }, { freezeTableName: true });

    persona.associate = function (models) {
        persona.belongsTo(models.rol, { foreignKey: 'id_rol' });
        persona.hasOne(models.cuenta, { foreignKey: 'id_persona', as: "cuenta"});

        persona.hasMany(models.factura,  { foreignKey: 'id_persona', as: "factura"});
        persona.hasMany(models.orden, {foreignKey: "id_persona", as: "orden"});
    }

    return persona;
};