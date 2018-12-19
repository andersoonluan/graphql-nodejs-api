import * as jwt from 'jsonwebtoken';

import { chai, db, app, expect, handleError } from './../../test-utils';
import { UserIntance } from '../../../src/models/UserModel';
import { PostInstance } from '../../../src/models/PostModel';
import { CommentInstance } from '../../../src/models/CommentModel';

describe('Comment', () => {

    let token: string;
    let userId: number;
    let postId: number;
    let commentId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.create(
                {
                    name: 'Post Comment',
                    email: 'rocket@gmail.com',
                    password: '1234'
                }
            )).then((user: UserIntance) => {
                userId = user.get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, "JWT_SECRET");

                return db.Post.create(
                    {
                        title: 'First Post',
                        content: 'First post for test with Mocha and Chai.',
                        author: userId,
                        photo: 'some_photo'
                    }
                );
            }).then((post: PostInstance) => {
                postId = post.get('id');

                return db.Comment.bulkCreate([
                    {
                        comment: 'First Comment',
                        user: userId,
                        post: postId
                    },
                    {
                        comment: 'Second Comment',
                        user: userId,
                        post: postId
                    },
                    {
                        comment: 'Third Comment',
                        user: userId,
                        post: postId
                    }
                ]);
            }).then((comments: CommentInstance[]) => {
                commentId = comments[0].get('id');
            });
    });

    describe('Queries', () => {
        
        describe('application/json', () => {
            
            describe('commentsByPost', () => {
                it('sould return a list of Comments', () => {
                    let body = {
                        query: `
                            query getCommentsByPostList($postId: ID!, $first: Int, $offset: Int) {
                                commentsByPost(postId: $postId, first: $first, offset: $offset) {
                                   comment
                                   user {
                                       id
                                   }
                                   post {
                                       id
                                   }
                                }
                            }
                        `,
                        variables: {
                            postId: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const commentsList = res.body.data.commentsByPost;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            //test validation 2
                            expect(commentsList).to.be.an('array'); 
                            // test validation 3
                            expect(commentsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt']); 
                            expect(commentsList[0]).to.have.keys(['comment', 'user', 'post']);
                            expect(parseInt(commentsList[0].user.id)).to.equals(userId);
                            expect(parseInt(commentsList[0].post.id)).to.equals(postId);
                        })
                        .catch(handleError);
                })
            });

        });

    });

    describe('Mutations', () => {

        describe('appplication/json', () => {
        
            describe('createComment', () => {
                
                it('should create a new Comment', () => {
                    let body = {
                        query: `
                            mutation createNewComment($input: CommentInput!) {
                                createComment(input: $input) {
                                   comment
                                   user {
                                       id
                                       name
                                   }
                                   post {
                                       id
                                       title
                                   }
                                }
                            }
                        `,
                        variables: {
                            input: {
                                comment: 'First Comment Test Mutation',
                                post: postId
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const createdComment = res.body.data.createComment;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            expect(res.body.data).to.have.key('createComment');
                            //test validation 2
                            expect(createdComment).to.be.an('object'); 
                            // test validation 3
                            expect(createdComment).to.have.keys(['comment', 'user', 'post']);
                            expect(parseInt(createdComment.user.id)).to.equals(userId);
                            expect(createdComment.user.name).to.equals('Post Comment');
                            expect(parseInt(createdComment.post.id)).to.equals(postId);
                            expect(createdComment.post.title).to.equals('First Post');
                        })
                        .catch(handleError);
                });
            });

            describe('updateComment', () => {
                
                it('should update an existing Comment', () => {
                    let body = {
                        query: `
                            mutation updateExistingComment($id: ID!, $input: CommentInput!) {
                                updateComment(id: $id, input: $input) {
                                   id
                                   comment
                                }
                            }
                        `,
                        variables: {
                            id: commentId,
                            input: {
                                comment: 'Comment Changed',
                                post: postId
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const updatedComment = res.body.data.updateComment;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            expect(res.body.data).to.have.key('updateComment');
                            expect(updatedComment).to.be.an('object');
                            expect(updatedComment).to.have.keys(['id', 'comment']);
                            expect(updatedComment.comment).to.equal('Comment Changed');
                        })
                        .catch(handleError);
                });
            });

            describe('deleteComment', () => {
                
                it('should delete an existing Comment', () => {
                    let body = {
                        query: `
                            mutation deleteExistingComment($id: ID!) {
                                deleteComment(id: $id)
                            }
                        `,
                        variables: {
                            id: commentId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const deletedComment = res.body.data.deleteComment;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            expect(res.body.data).to.have.key('deleteComment');
                            expect(deletedComment).to.be.true;
                            
                        })
                        .catch(handleError);
                });
            });

        });
    });

});