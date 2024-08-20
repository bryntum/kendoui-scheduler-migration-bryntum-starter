import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const KendoUIResource = sequelize.define(
    'KendoUIResource',
    {
        value : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        text : {
            type      : DataTypes.STRING,
            allowNull : false
        },
        color : {
            type         : DataTypes.STRING,
            defaultValue : null
        }
    },
    {
        tableName  : 'kendoui_resources',
        timestamps : false
    }
);

export default KendoUIResource;
