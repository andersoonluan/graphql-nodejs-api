import * as DataLoader from 'dataloader';
import { UserIntance } from '../models/UserModel';
import { PostInstance } from '../models/PostModel';
import { DataLoaderParam } from './DataLoaderParamInterface';

export interface DataLoaders{ 

    userLoader: DataLoader<DataLoaderParam<number>, UserIntance>;
    postLoader: DataLoader<DataLoaderParam<number>, PostInstance>;

}