import { GraphQLResolveInfo} from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserIntance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import {handleError} from "../../../utils/utils";


export const userResolvers = { 

    // Resolver for user posts.
    User: {
        posts: (user, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: {author: user.get('id')},
                    limit: first,
                    offset: offset
                })
                .catch(handleError);
        }
    },

    Query : {

        // Query user, return list of users in DB.
        users: (parent, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User
                .findAll({
                    limit: first,
                    offset: offset
                })
                .catch(handleError);
        },

        // Query user, return user by ID.
        user: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.User.findById(id)
            .then((user: UserIntance) => {
                if(!user)
                    throw new Error(`User with id ${id} not found!`);
                return user;
            })
            .catch(handleError);
        }

    },

    /**
     * Querys Mutations for Users
     * @author Anderson Luan Souza Rodrigues
     */
    Mutation : {

        // Query for creation user with args inputs.
        createUser: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, {transaction: t});
            })
            .catch(handleError);
        },
        
        // Query for update user with args inputs.
        updateUser: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = (parseInt(id));  
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserIntance) => {
                        if(!user)
                            throw new Error(`User with id ${id} not found!`);
                        return user.update(input, {transaction: t});
                    })
            })
            .catch(handleError);
        },

        // Query for update user Password with args inputs.
        updateUserPassword: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = (parseInt(id));  
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserIntance) => {
                        if(!user)
                            throw new Error(`User with id ${id} not found!`);
                        return user.update(input, {transaction: t})
                        .then((user: UserIntance) => !! user);
                    })
            })
            .catch(handleError);      
        },

        // Query for delete user!
        deleteUser:  (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);  
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserIntance) => {
                        if(!user)
                            throw new Error(`User with id ${id} not found!`);
                        return user.destroy({transaction: t})
                            .then(user => true)
                            .catch(handleError);
                    });
            })
            .catch(handleError);
        }       

    }

}