'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const persona = sequelize.define('persona', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true},
        foto: { type: DataTypes.STRING(80), defaultValue: "NO_DATA"},
        nombres: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        tipo_identificacion: {type: DataTypes.ENUM("CEDULA", "PASAPORTE", "RUC"), defaultValue: "CEDULA"},
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
                                    return next("La identificación ya está siendo utilizada por otra persona");
                                }
                                return next();
                            }).catch(
                                function (err) {
                                return next(err);
                            });
                }
            }
        },  
        fecha_nacimiento: { type: DataTypes.DATE},
        telefono:  { type: DataTypes.STRING(20), defaultValue: "NO_DATA"}  ,
        direccion: {type: DataTypes.STRING(255), defaultValue: "NO_DATA"}
    }, {
        freezeTableName: true
    });
    persona.associate = function (models){
        persona.hasMany(models.persona_rol, {foreignKey: 'id_persona',as:'persona_rol'});
        persona.hasOne(models.cuenta, { foreignKey: 'id_persona', as: 'cuenta'});
        persona.hasMany(models.matricula, {foreignKey: 'id_persona',as:'matricula'});
    };
 
    return persona;
};