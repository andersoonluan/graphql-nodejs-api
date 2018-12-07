import * as Sequelize from 'sequelize';
import { BaseModelinterface } from '../interfaces/BaseModelInterface';
import { ModelsInterface } from '../interfaces/ModelsInterface';
import { userInfo } from 'os';

// Definição dos atributos iniciais da tabela.
export interface CommentAttributes {

    id?: number;
    comment?: string;
    post?: number;
    user?: number;
    createdAt?: string;
    updatedAt?: string;

}

export interface CommentInstance extends Sequelize.Instance<CommentAttributes>{ }

export interface CommentModel extends BaseModelinterface, Sequelize.Model<CommentInstance, CommentAttributes> { }

// Define datatable attributes
export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes) : CommentModel => {

    const Comment : CommentModel = sequelize.define('Comment', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        }

    }, 
    {
        tableName: 'comments'
    })

    Comment.associate = (models: ModelsInterface) : void => {

        // Foreign Key with table POST
        Comment.belongsTo(models.Post, {
            foreignKey:{
                allowNull:false,
                field: 'post',
                name: 'post'
            }
        });

        // Foreign Key with table USER
        Comment.belongsTo(models.User, {
            foreignKey:{
                allowNull: false,
                field: 'user',
                name: 'user'
            }
        })

    }

    return Comment;
};