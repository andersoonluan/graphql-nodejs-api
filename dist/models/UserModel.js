"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = require("bcryptjs");
exports.default = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: false,
            defaultValue: ''
        }
    }, {
        tableName: 'users',
        hooks: {
            // Trigger para criptografar o passwords
            beforeCreate: (user, options) => {
                const salt = bcryptjs_1.genSaltSync();
                user.password = bcryptjs_1.hashSync(user.password, salt);
            },
            // Only password changed.
            beforeUpdate: (user, options) => {
                if (user.changed('password')) {
                    const salt = bcryptjs_1.genSaltSync();
                    user.password = bcryptjs_1.hashSync(user.password, salt);
                }
            }
        }
    });
    User.associate = (models) => { };
    // Funcao para comparar os passwords
    User.prototype.isPassword = (encodedPassword, password) => {
        return bcryptjs_1.compareSync(password, encodedPassword);
    };
    return User;
};