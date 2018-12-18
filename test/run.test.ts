import { db } from './test-utils';

// Force sincronization with DB Test
db.sequelize.sync({force: true})
    .then(() => run());