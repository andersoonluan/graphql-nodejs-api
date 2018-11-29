import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError} from "../../../utils/utils";

export const commentResolvers = {

    Comment: {

        // Get post by author
        user: (comment, args, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User
                .findById(comment.get('user'))
                .catch(handleError);
        },
        // Get comment by post
        post: (comment, args, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findById(comment.get('post'))
                .catch(handleError);
        }

    },

    Query: {
        // Method find comments by post.
        commentsByPost: (parent, {postId, first = 10, offset = 0 }, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            postId = parseInt(postId);
            return db.Comment
                .findAll({
                    where: {post: postId},
                    limit: first,
                    offset: offset
                })
                .catch(handleError);
        }
    },

    Mutation: { 

        // Method for create comment in page.
        createComment: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, {transaction: t});
            })
            .catch(handleError);
        },

        // Method for update comment in page.
        updateComment: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) =>{
                        if(!comment)
                            throw new Error(`Comment with id ${id} not found!`);
                            return comment.update(input, {transaction: t});
                    });
            })
            .catch(handleError);
        },

        // Method for delete comment in page.
        deleteComment: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) =>{
                        if(!comment)
                            throw new Error(`Comment with id ${id} not found!`);
                            return comment.destroy({transaction: t})
                                .then(comment => true)
                                .catch(handleError);
                    });
            })
            .catch(handleError);
        }



    }

};
