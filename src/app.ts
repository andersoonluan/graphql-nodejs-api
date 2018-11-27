import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models';
import schema from './graphql/schema';


class App {

    public express: express.Application;

    constructor () {
        this.express = express();
        this.middleware();
    }

    private middleware() : void {

       this.express.use('/graphql', 
       
            // Config Context DB Connection
            (req, res, next) => {
                req['context'] = {};
                req['context'].db = db;
                next();
            },
            // Config GraphQL Middleware
            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: process.env.NODE_ENV.trim() === 'development',
                context: req['context']
            }))
       );
    }
}

export default new App().express;