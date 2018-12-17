import * as DataLoader from 'dataloader';

import { UserIntance } from '../../models/UserModel';
import { PostInstance } from '../../models/PostModel';

import { DbConnection } from "../../interfaces/DbConnectionInterface";
import { DataLoaders } from "../../interfaces/DataLoadersInterface";
import { UserLoader } from './UserLoader';
import { PostLoader } from './PostLoader';

export class DataLoaderFactory {

    constructor(
        private db: DbConnection
    ) { }

    getLoaders() : DataLoaders {
        return {
            userLoader: new DataLoader<number, UserIntance>(
                (ids: number[]) => UserLoader.batchUsers(this.db.User, ids)
            ),
            postLoader: new DataLoader<number, PostInstance>(
                (ids: number[]) => PostLoader.batchPost(this.db.Post, ids)
            )
        };
    }

}