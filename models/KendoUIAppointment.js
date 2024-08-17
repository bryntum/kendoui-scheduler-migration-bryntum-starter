import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KendoUIAppointment = sequelize.define(
  "KendoUIAppointment",
  {
    meetingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    end: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    startTimezone: {
      type: DataTypes.STRING,
    },
    endTimezone: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    recurrenceID: {
      type: DataTypes.STRING,
    },
    recurrenceRule: {
      type: DataTypes.STRING,
    },
    recurrenceException: {
      type: DataTypes.STRING,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "kendoui_resources",
        key: "value",
      },
      onDelete: "CASCADE", // This will delete all appointments referencing the resource when it's deleted
    },
    isAllDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "kendoui_appointments",
    timestamps: false,
    indexes: [
      {
        fields: ["start", "end"],
      },
    ],
  }
);

export default KendoUIAppointment;