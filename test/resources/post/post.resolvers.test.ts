import * as jwt from 'jsonwebtoken';

import { chai, db, app, expect, handleError } from './../../test-utils';
import { UserIntance } from '../../../src/models/UserModel';
import { PostInstance } from '../../../src/models/PostModel';

describe('Post', () => {

    let token: string;
    let userId: number;
    let postId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.create(
                {
                    name: 'Rocket',
                    email: 'rocket@gmail.com',
                    password: '1234'
                }
            )).then((user: UserIntance) => {
                userId = user.get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, "JWT_SECRET");

                return db.Post.bulkCreate([
                    {
                        title: 'First Post',
                        content: 'First post for test with Mocha and Chai.',
                        author: userId,
                        photo: 'some_photo'
                    },
                    {
                        title: 'Second Post',
                        content: 'Second post for test with Mocha and Chai.',
                        author: userId,
                        photo: 'some_photo'
                    },
                    {
                        title: 'Third Post',
                        content: 'Third post for test with Mocha and Chai.',
                        author: userId,
                        photo: 'some_photo'
                    }
                ]);
            }).then((posts: PostInstance[]) => {
                postId = posts[0].get('id');
            });
    });

    describe('Queries', () => {
        
        describe('application/json', () => {

            describe('posts', () => {

                it('sould return a list of Posts', () => {
                    let body = {
                        query: `
                            query {
                                posts {
                                    title
                                    content
                                    photo
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const postsList = res.body.data.posts;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            //test validation 2
                            expect(postsList).to.be.an('array'); 
                            // test validation 3
                            expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']); 
                            expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postsList[0].title).to.equals('First Post');
                        })
                        .catch(handleError);
                });
            });

            describe('post', () => {

                it('sould return a single Post with your author', () => {
                    let body = {
                        query: `
                            query getPost($id: ID!){
                                post(id: $id) {
                                    title
                                    author{ 
                                        name
                                        email
                                    }
                                    comments {
                                        comment
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singlePost = res.body.data.post;
                            expect(res.body.data).to.have.key('post');
                            expect(singlePost).to.be.an('object');
                            expect(singlePost).to.have.keys(['title', 'author', 'comments']);
                            expect(singlePost.title).to.equals('First Post');
                            expect(singlePost).to.not.have.keys(['content']);
                            expect(singlePost.author).to.be.an('object').with.keys(['name', 'email']);
                            expect(singlePost.author).to.be.an('object').with.not.keys(['id', 'updatedAt', 'posts']);
                        })
                        .catch(handleError);
                });
            });

        });

        describe('application/graphql', () => {

            describe('posts', () => {

                it('sould return a list of Posts using application/graphql', () => {
                    let query = `
                            query {
                                posts {
                                    title
                                    content
                                    photo
                                }
                            }
                        `;
                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .then(res => {
                            const postsList = res.body.data.posts;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            //test validation 2
                            expect(postsList).to.be.an('array'); 
                            // test validation 3
                            expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']); 
                            expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postsList[0].title).to.equals('First Post');
                        })
                        .catch(handleError);
                });

            });
        });

    });
});