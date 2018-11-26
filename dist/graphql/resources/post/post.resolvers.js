"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
exports.postResolvers = {
    // Get Posts by Author
    Post: {
        author: (post, args, { db }, info) => {
            return db.User
                .findById(post.get('author'))
                .catch(utils_1.handleError);
        },
        comments: (post, { first = 10, offset = 0 }, { db }, info) => {
            return db.Comment
                .findAll({
                where: { post: post.get('id') },
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        }
    },
    Query: {
        // Query for return all posts of user.
        posts: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        },
        // Return unique post by ID.
        post: (parent, { id }, { db }, info) => {
            return db.Post
                .findById(id)
                .then((post) => {
                if (!post)
                    throw new Error(`Post with id ${id} not found! `);
                return post;
            })
                .catch(utils_1.handleError);
        }
    },
    // Mutations for Posts
    Mutation: {
        // Method for create post.
        createPost: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.Post
                    .create(input, { transaction: t });
            })
                .catch(utils_1.handleError);
        },
        // Method for update post
        updatePost: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found! `);
                    return post.update(input, { transaction: t });
                });
            })
                .catch(utils_1.handleError);
        },
        // Method for delete post.
        deletePost: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found! `);
                    return post.destroy({ transaction: t })
                        .then(post => !!post);
                });
            })
                .catch(utils_1.handleError);
        }
    }
};
