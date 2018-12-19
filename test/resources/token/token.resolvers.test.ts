import { chai, db, app, expect, handleError } from './../../test-utils';

describe('Token', () => {

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.create(
                {
                    name: 'Generate',
                    email: 'token@gmail.com',
                    password: '1234'
                }
            )).catch(handleError);
    });

    describe('Mutations', () => {

        describe('application/json', () => {
        
            describe('createToken', () => {
        
                it('should return a new valid Token', () => {
                    let body = {
                        query: `
                            mutation createNewToken($email: String!, $password: String!) {
                                createToken(email: $email, password: $password){
                                    token
                                }
                            }
                        `,
                        variables: {
                            email: 'token@gmail.com',
                            password: '12345'
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data).to.have.key('createToken');
                        }).catch(handleError);
                });
            });
        });
    });
});