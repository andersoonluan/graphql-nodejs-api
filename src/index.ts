import * as http from 'http';
import app from './app';
import db from './models/index';
import { normalizePort, onError, onListening } from './utils/utils';

const server = http.createServer(app);
const port = normalizePort(3000);

// Sincronização do MYSQL
db.sequelize.sync()
    .then(() => {

        server.listen(port);
        server.on('error', onError(server))
        server.on('listening', onListening(server));

});

