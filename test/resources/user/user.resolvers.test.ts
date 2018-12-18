import * as jwt from 'jsonwebtoken';

import { app, db, chai, handleError, expect } from './../../test-utils';
import { UserIntance } from '../../../src/models/UserModel';


describe('User', () => {

    let token: string;
    let userId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.bulkCreate([
                {
                    name: 'Mocha Test 1',
                    email: 'test1@gmail.com',
                    password: '1234'
                },
                {
                    name: 'Mocha Test 2',
                    email: 'test2@gmail.com',
                    password: '1234'
                },
                {
                    name: 'Mocha Test 3',
                    email: 'test3@gmail.com',
                    password: '1234'
                }
            ])).then((users: UserIntance[]) => {
                userId = users[0].get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, "JWT_SECRET");
            });
    });

    // Tests for queries
    describe('Queries', () => {

        describe('application/json', () => {

            // endpoint users
            describe('users', () => {

                it('Query 1: should return a list of Users', () => {

                    let body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const usersList = res.body.data.users;
                            expect(res.body.data).to.be.an('object'); //test validation 1
                            expect(usersList).to.be.an('array'); //test validation 2
                            expect(usersList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']); // test validation 3
                            expect(usersList[0]).to.have.keys(['name', 'email']);
                        })
                        .catch(handleError);
                });

                it('Query 2: should paginate a list of Users', () => {

                    let body = {
                        query: `
                            query getUsersList($first: Int, $offset: Int){
                                users(first: $first, offset: $offset) {
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            first: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const usersList = res.body.data.users;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            //test validation 2
                            expect(usersList).to.be.an('array').of.length(2);
                            // test validation 3 
                            expect(usersList[0]).to.not.have.keys(['id', 'photo', 'updatedAt', 'posts']); 
                            // test validation 4
                            expect(usersList[0]).to.have.keys(['name', 'email', 'createdAt']);
                        })
                        .catch(handleError);
                })

            });

            // endpoint user
            describe('user', () => {
                
                it('Query 3: should return a single User', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!){
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                           id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys(['id', 'name', 'email', 'posts'])
                            expect(singleUser.name).to.equals('Mocha Test 1');
                            expect(singleUser.email).to.equals('test1@gmail.com');
                        })
                        .catch(handleError);
                })

                it('Query 4: should return only \'name\' attribute', () => {

                    let body = {
                        query: `
                            query getOnlyName($id: ID!){
                                user(id: $id) {
                                   name
                                }
                            }
                        `,
                        variables: {
                           id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            //test validation 1
                            expect(res.body.data).to.be.an('object'); 
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.key('name')
                            expect(singleUser.name).to.equals('Mocha Test 1');
                            expect(singleUser.email).to.be.undefined;
                            expect(singleUser.createdAt).to.be.undefined;
                            expect(singleUser.posts).to.be.undefined;
                        })
                        .catch(handleError);
                })

                it('Query 5: should return an error if User not exists', () => {

                    let body = {
                        query: `
                            query getReturnError($id: ID!){
                                user(id: $id) {
                                   name
                                   email
                                }
                            }
                        `,
                        variables: {
                           id: -1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            //test validation 1
                            expect(res.body.data.user).to.be.null;
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body).to.have.keys(['data', 'errors']);
                            expect(res.body.errors[0].message).to.equals('Error: User with id -1 not found!');
                        })
                        .catch(handleError);
                })
 
            })

        });
    });

    // Tests for Mutations
    describe('Mutations', () => {

        describe('application/json', () => {

            describe('createUser', () => {
                it('Mutation 1: should create new User', () => {

                    let body = {
                        query: `
                             mutation createNewUser($input: UserCreateInput!){
                                 createUser(input: $input){
                                     id
                                     name
                                     email
                                 }
                             }
                        `,
                        variables: {
                            input: {
                                name: 'Maria Vitorino',
                                email: 'maria@test.com',
                                password: '1234'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const createdUser = res.body.data.createUser;
                            expect(createdUser).to.be.an('object');
                            expect(createdUser.name).to.equal('Maria Vitorino');
                            expect(createdUser.email).to.equals('maria@test.com');
                            expect(parseInt(createdUser.id)).to.be.a('number');
                        }).catch(handleError);
                })
            });
        });

        describe('application/json', () => {

            describe('updateUser', () => {

                it('Mutation 2: should update an existing User', () => {

                    let body = {
                        query: `
                             mutation updateExistingUser($input: UserUpdateInput!){
                                 updateUser(input: $input){
                                     name
                                     email
                                     photo
                                 }
                             }
                        `,
                        variables: {
                            input: {
                                name: 'Jorge Vitorino',
                                email: 'jorge@test.com',
                                photo: 'some_photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const updatedUser = res.body.data.updateUser;
                            expect(updatedUser).to.be.an('object');
                            expect(updatedUser.name).to.equals('Jorge Vitorino');
                            expect(updatedUser.email).to.equals('jorge@test.com');
                            expect(updatedUser.photo).to.be.not.null;
                            expect(updatedUser.id).to.be.undefined;
                        }).catch(handleError);
                })

                it('Mutation 3: should block operation if token is invalid', () => {

                    let body = {
                        query: `
                             mutation updateExistingUser($input: UserUpdateInput!){
                                 updateUser(input: $input){
                                     name
                                     email
                                     photo
                                 }
                             }
                        `,
                        variables: {
                            input: {
                                name: 'Jorge Vitorino',
                                email: 'jorge@test.com',
                                photo: 'some_photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', 'Bearer INVALID_TOKEN')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.updateUser).to.be.null;
                            expect(res.body).to.have.keys(['data', 'errors']);
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body.errors[0].message).to.equal('JsonWebTokenError: jwt malformed');
                        }).catch(handleError);
                });

            });

            describe('updateUserPassword', () => {

                it('Mutation 4: should update the password of an existing User', () => {

                    let body = {
                        query: `
                             mutation updateUserPassword($input: UserUpdatePasswordInput!){
                                 updateUserPassword(input: $input)
                             }
                        `,
                        variables: {
                            input: {
                               password: 'anderson123'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.updateUserPassword).to.be.true;
                        }).catch(handleError);
                });
            })

            describe('deleteUser', () => {

                it('Mutation 5: should delete an existing User', () => {

                    let body = {
                        query: `
                             mutation {
                                 deleteUser
                             }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.deleteUser).to.be.true;
                        }).catch(handleError);
                });
            })

            
        });

    });
});