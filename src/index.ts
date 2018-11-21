import * as http from 'http';
import app from './app';
import { normalizePort, onError, onListening } from './utils/utils';

const server = http.createServer(app);
const port = normalizePort(5000);

server.listen(port);
server.on('error', onError(server))
server.on('listening', onListening(server));