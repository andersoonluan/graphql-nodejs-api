import { ModelsInterface } from "./ModelsInterface";

export interface BaseModelinterface{

    prototype?;
    associate?(models: ModelsInterface) : void;

}