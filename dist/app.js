"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const graphqlHTTP = require("express-graphql");
const models_1 = require("./models");
const schema_1 = require("./graphql/schema");
class App {
    constructor() {
        this.express = express();
        this.middleware();
    }
    middleware() {
        this.express.use('/graphql', 
        // Config Context DB Connection
        (req, res, next) => {
            req['context'] = {};
            req['context'].db = models_1.default;
            next();
        }, 
        // Config GraphQL Middleware
        graphqlHTTP((req) => ({
            schema: schema_1.default,
            graphiql: true,
            context: req['context']
        })));
    }
}
exports.default = new App().express;
