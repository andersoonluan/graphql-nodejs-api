import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models/index';
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';


class App {

    public express: express.Application;
    private dataLoaderFactory: DataLoaderFactory;
    private requestedFields : RequestedFields;

    constructor () {
        this.express = express();
        this.init();
    }

    private init() : void {
        this.requestedFields = new RequestedFields();
        this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
        this.middleware();
    }

    // Middleware to sincronization GraphQL
    private middleware() : void {

       this.express.use('/graphql', 
       
        extractJwtMiddleware(),

            // Config Context DB Connection
            (req, res, next) => {
                req['context']['db'] = db;
                req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
                req['context']['requestedFields'] = this.requestedFields;
                next();
            },
            // Config GraphQL Middleware
            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: process.env.NODE_ENV.trim() === 'development' ? true : false,
                context: req['context']
            }))
       );
    }
}

export default new App().express;