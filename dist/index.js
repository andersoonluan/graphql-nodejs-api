"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const app_1 = require("./app");
const models_1 = require("./models");
const utils_1 = require("./utils/utils");
const server = http.createServer(app_1.default);
const port = utils_1.normalizePort(5000);
// Sincronização do MYSQL
models_1.default.sequelize.sync()
    .then(() => {
    server.listen(port);
    server.on('error', utils_1.onError(server));
    server.on('listening', utils_1.onListening(server));
});
