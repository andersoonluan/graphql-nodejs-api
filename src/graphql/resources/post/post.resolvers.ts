import { GraphQLResolveInfo} from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { PostInstance } from '../../../models/PostModel';
import { Transaction } from "sequelize";
import { handleError, throwError} from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

export const postResolvers = {

    // Get Posts by Author
    Post: {
        author: (post, args, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User
                .findById(post.get('author'))
                .catch(handleError);
        },

        comments: (post, {first = 10, offset = 0}, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Comment
                .findAll({
                    where: { post: post.get('id')},
                    limit: first,
                    offset: offset
                })
                .catch(handleError);
        }
    },

    Query: {

        // Query for return all posts of user.
        posts : (parent, {first = 10, offset = 0}, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    limit: first,
                    offset: offset
                })
                .catch(handleError);
        },

        // Return unique post by ID.
        post: (parent, {id}, {db} : {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.Post
                .findById(id)
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found! `);
                    return post;
                })
                .catch(handleError);
        }

    },

    // Mutations for Posts
    Mutation: {
        // Method for create post.
        createPost: compose(...authResolvers) // JWT AUTHENTICATION
        ((parent, {input}, {db, authUser} : {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.author = authUser.id
            return db.sequelize.transaction((t: Transaction) =>{
                return db.Post
                .create(input, {transaction: t});
            })
            .catch(handleError);
        }),
        // Method for update post
        updatePost: compose(...authResolvers) // JWT AUTHENTICATION
        ((parent, {id, input}, {db, authUser} : {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) =>{
               return db.Post
                .findById(id)
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found! `);
                    throwError(post.get('author')!= authUser.id, `Unauthorized! You can only edit posts by yourself!`);
                    input.author = authUser.id
                    return post.update(input, {transaction: t});
                });
            })
            .catch(handleError);
        }),
        // Method for delete post.
        deletePost: compose(...authResolvers) // JWT AUTHENTICATION
        ((parent, {id}, {db, authUser} : {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) =>{
               return db.Post
                .findById(id)
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found! `);
                    throwError(post.get('author')!= authUser.id, `Unauthorized! You can only delete posts by yourself!`);
                    return post.destroy({transaction: t})
                        .then(post => true)
                        .catch(handleError);
                })
            })
            .catch(handleError);
        })
    }

};