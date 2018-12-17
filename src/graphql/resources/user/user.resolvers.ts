import { GraphQLResolveInfo} from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserIntance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import {handleError, throwError} from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolver, authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { RequestedFields } from "../../ast/RequestedFields";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";


export const userResolvers = { 

    // Resolver for user posts.
    User: {
        posts: (user, {first = 10, offset = 0}, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.Post
                .findAll({
                    where: {author: user.get('id')},
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['comments']})
                })
                .catch(handleError);
        }
    },

    Query : {

        // Query user, return list of users in DB.
        users: (parent, {first = 10, offset = 0}, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
                .findAll({
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                })
                .catch(handleError);
        },

        // Query user, return user by ID.
        user: (parent, {id}, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return context.db.User.findById(id, {
                attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
            })
            .then((user: UserIntance) => {
                throwError(!user,
                    `User with id ${id} not found!`);
                return user;
            })
            .catch(handleError);
        },

        // Query for return current User for authentication
        currentUser: compose(...authResolvers) //JWT TOKEN VALIDATION
        ((parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
                return context.db.User
                    .findById(context.authUser.id, {
                        attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                    })
                    .then((user: UserIntance) => {
                        throwError(!user,
                            `User with id ${context.authUser.id} not found!`);
                        return user;
                    }).catch(handleError);                  
        })

    },

    /**
     * Queries Mutations for Users
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
        updateUser: compose(...authResolvers) //JWT TOKEN VALIDATION
        ((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserIntance) => {
                        throwError(!user,
                            `User with id ${authUser.id} not found!`);
                        return user.update(input, {transaction: t});
                    })
            })
            .catch(handleError);
        }),

        // Query for update user Password with args inputs.
        updateUserPassword: compose(...authResolvers) //JWT TOKEN VALIDATION
        ((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserIntance) => {
                        throwError(!user,
                            `User with id ${authUser.id} not found!`);
                        return user.update(input, {transaction: t})
                        .then((user: UserIntance) => !! user);
                    })
            })
            .catch(handleError);      
        }),

        // Query for delete user!
        deleteUser: compose(...authResolvers) //JWT TOKEN VALIDATION
        ((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserIntance) => {
                        throwError(!user,
                            `User with id ${authUser.id} not found!`);
                        return user.destroy({transaction: t})
                            .then(user => true)
                            .catch(handleError);
                    });
            })
            .catch(handleError);
        })       

    }

}