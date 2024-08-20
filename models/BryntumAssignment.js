import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BryntumAssignment = sequelize.define(
    'BryntumAssignment',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        eventId : {
            type       : DataTypes.INTEGER,
            allowNull  : false,
            references : {
                model : 'bryntum_events',
                key   : 'id'
            },
            onDelete : 'CASCADE' // Ensures that deleting an 'event' will delete related 'assignments'
        },
        resourceId : {
            type       : DataTypes.INTEGER,
            allowNull  : false,
            references : {
                model : 'bryntum_resources',
                key   : 'id'
            },
            onDelete : 'CASCADE' // This will delete all assignments referencing the resource when it's deleted
        }
    },
    {
        tableName  : 'bryntum_assignments',
        timestamps : false,
        indexes    : [
            {
                fields : ['eventId']
            },
            {
                fields : ['resourceId']
            }
        ]
    }
);

export default BryntumAssignment;
