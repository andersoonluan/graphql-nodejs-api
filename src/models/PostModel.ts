import * as Sequelize from 'sequelize';
import { BaseModelinterface } from '../interfaces/BaseModelInterface';
import { ModelsInterface } from '../interfaces/ModelsInterface';
import UserModel from './UserModel';

export interface PostAttributes {

    id? : number,
    title?: string,
    content?: string,
    photo?: string,
    author?: number,
    createdAt?: string,
    updatedAt?: string

}

export interface PostInstance extends Sequelize.Instance<PostAttributes> { }

export interface PostModel extends BaseModelinterface, Sequelize.Model<PostInstance, PostAttributes> { }

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes) : PostModel => {

    const Post: PostModel = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: false
        }
    }, 
    {
        tableName: 'posts'
    })

    Post.associate = (models: ModelsInterface) : void => {
        // Cria a FK entre a tabela Post e Usuários
        Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'author',
                name: 'author'
            }
        });
    }

    return Post;

}