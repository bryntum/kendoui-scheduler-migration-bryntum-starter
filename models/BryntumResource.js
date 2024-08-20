import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BryntumResource = sequelize.define(
    'BryntumResource',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        name : {
            type      : DataTypes.STRING,
            allowNull : false
        },
        eventColor : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        readOnly : {
            type         : DataTypes.BOOLEAN,
            defaultValue : false
        },
        parentId : {
            type         : DataTypes.INTEGER,
            defaultValue : null,
            references   : {
                model : 'bryntum_resources',
                key   : 'id'
            },
            onDelete : 'CASCADE' // This will delete all child resources referencing the resource when it's deleted - if using tree store with a flat dataset: https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/treedata#transforming-flat-data
        },
        index : {
            type         : DataTypes.INTEGER,
            defaultValue : null
        }
    },
    {
        tableName  : 'bryntum_resources',
        timestamps : false,
        indexes    : [
            {
                fields : ['index', 'parentId']
            }
        ]
    }
);

export default BryntumResource;
