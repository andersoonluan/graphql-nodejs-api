"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = {
    Query: {
        // Query user, return list of users in DB.
        users: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.User
                .findAll({
                limit: first,
                offset: offset
            });
        },
        // Query user, return user by ID.
        user: (parent, { id }, { db }, info) => {
            return db.User.findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`User with id ${id} not found!`);
                return user;
            });
        }
    },
    /**
     * Querys Mutations for Users
     * @author Anderson Luan Souza Rodrigues
     */
    Mutation: {
        // Query for creation user with args inputs.
        createUser: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .create(input, { transaction: t });
            });
        },
        // Query for update user with args inputs.
        updateUser: (parent, { id, input }, { db }, info) => {
            id = (parseInt(id));
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.update(input, { transaction: t });
                });
            });
        },
        // Query for update user Password with args inputs.
        updateUserPassword: (parent, { id, input }, { db }, info) => {
            id = (parseInt(id));
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.update(input, { transaction: t })
                        .then((user) => !!user);
                });
            });
        },
        // Query for delete user!
        deleteUser: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.destroy({ transaction: t })
                        .then(user => !!user);
                });
            });
        }
    }
};