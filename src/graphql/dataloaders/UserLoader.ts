import { UserModel, UserIntance } from "../../models/UserModel";
import { DataLoaderParam } from "../../interfaces/DataLoaderParamInterface";
import { RequestedFields } from "../ast/RequestedFields";

export class UserLoader {

    // Return users with IDs
    static batchUsers(User: UserModel, params: DataLoaderParam<number>[], requestedFields: RequestedFields) : Promise<UserIntance[]>{
        
        let ids: number[] = params.map(param => param.key)

        return Promise.resolve(
            User
            .findAll({
                where: { id: {$in: ids} },
                attributes: requestedFields.getFields(params[0].info, {keep: ['id'], exclude: ['posts']})
            })
        );
    }
}