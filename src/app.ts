import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import * as cors from 'cors';
import * as compression from 'compression';
import * as helmet from 'helmet';

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

        
        // Config CORS
        this.express.use(cors({
            origin: '*',
            methods: ['GET','POST'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Encoding'],
            preflightContinue: false,
            optionsSuccessStatus: 204
        }));
        
        // Set compression 
        this.express.use(compression());
        // Set Helmet for security
        this.express.use(helmet());

        this.express.use('/healthcheck', require('express-healthcheck')({
            healthy: function () {
                var os = require('os');
                return { 
                    everything: 'running',
                    serverName:  os.hostname() ,
                    clusters: os.cpus(),
                    up: os.uptime(),
                    release: os.release(),
                    freemem: os.freemem(),
                    type: os.type()
                };
            }
        }));

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
                graphiql: process.env.NODE_ENV === 'development' ? true : false,
                context: req['context']
            }))
       );
    }
}

export default new App().express;