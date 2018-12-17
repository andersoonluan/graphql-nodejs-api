import { UserModel, UserIntance } from "../../models/UserModel";

export class UserLoader {

    // Return users with IDs
    static batchUsers(User: UserModel, ids: number[]) : Promise<UserIntance[]>{
        return Promise.resolve(
            User
            .findAll({
                where: { id: {$in: ids} }
            })
        );
    }
}