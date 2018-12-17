import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError, throwError} from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolver, authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

export const commentResolvers = {

    Comment: {

        // Get post by author
        user: (comment, args, {db, dataloaders: {userLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return userLoader
                .load({key: comment.get('user'), info})
                .catch(handleError);
        },
        // Get comment by post
        post: (comment, args, {db, dataloaders: {postLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return postLoader
                .load({key: comment.get('post'), info})
                .catch(handleError);
        }

    },

    Query: {
        // Method find comments by post.
        commentsByPost: (parent, {postId, first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            postId = parseInt(postId);
            return context.db.Comment
                .findAll({
                    where: {post: postId},
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info)
                })
                .catch(handleError);
        }
    },

    Mutation: { 

        // Method for create comment in page.
        createComment: compose(...authResolvers) // JWT AUTHENTICATION
        ((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.user = authUser.id
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, {transaction: t});
            })
            .catch(handleError);
        }),

        // Method for update comment in page.
        updateComment: compose(...authResolvers) // JWT AUTHENTICATION
        ((parent, {id, input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) =>{
                        throwError(!comment, `Comment with id ${id} not found! `);
                        throwError(comment.get('user')!= authUser.id, `Unauthorized! You can only edit comments by yourself!`);
                         input.user = authUser.id
                         return comment.update(input, {transaction: t});
                    });
            })
            .catch(handleError);
        }),

        // Method for delete comment in page.
        deleteComment: compose(...authResolvers) // JWT AUTHENTICATION
        ((parent, {id}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) =>{
                        if(!comment)
                        throwError(!comment, `Comment with id ${id} not found! `);
                        throwError(comment.get('user')!= authUser.id, `Unauthorized! You can only delete comment by yourself!`);
                            return comment.destroy({transaction: t})
                                .then(comment => true)
                    });
            })
            .catch(handleError);
        })



    }

};
