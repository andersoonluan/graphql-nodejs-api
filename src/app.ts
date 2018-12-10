import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models/index';
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';


class App {

    public express: express.Application;

    constructor () {
        this.express = express();
        this.middleware();
    }

    // Middleware to sincronization GraphQL
    private middleware() : void {

       this.express.use('/graphql', 
       
        extractJwtMiddleware(),

            // Config Context DB Connection
            (req, res, next) => {
                req['context'].db = db;
                next();
            },
            // Config GraphQL Middleware
            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: true, //process.env.NODE_ENV.trim() === 'development',
                context: req['context']
            }))
       );
    }
}

export default new App().express;