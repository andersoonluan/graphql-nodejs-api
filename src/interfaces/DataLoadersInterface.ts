import * as DataLoader from 'dataloader';
import { UserIntance } from '../models/UserModel';
import { PostInstance } from '../models/PostModel';

export interface DataLoaders{ 

    userLoader: DataLoader<number, UserIntance>;
    postLoader: DataLoader<number, PostInstance>;

}