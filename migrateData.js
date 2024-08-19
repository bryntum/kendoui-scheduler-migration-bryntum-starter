import sequelize from "./config/database.js";
import {
  KendoUIAppointment,
  KendoUIResource,
  BryntumResource,
  BryntumEvent,
  BryntumAssignment,
} from "./models/index.js";

async function setupDatabase() {
  // Wait for all models to synchronize with the database
  await sequelize.sync();

  // Now add example data
  await migrateExampleData();
}

async function migrateExampleData() {
  try {
    // Read the existing data
    const kendoUIResourcesDataPromise = await KendoUIResource.findAll();
    const kendoUIAppointmentsDataPromise = await KendoUIAppointment.findAll();

    const [kendoUIResourcesData, kendoUIAppointmentsData] = await Promise.all([
      kendoUIResourcesDataPromise,
      kendoUIAppointmentsDataPromise,
    ]);

    // transform data to match existing Bryntum data structure
    const bryntumResourcesData = [];
    const bryntumAssignmentsData = [];
    const bryntumEventsData = [];

    let index = 0;
    for (let resource of kendoUIResourcesData) {
      const bryntumResource = {};
      bryntumResource.id = resource.value;
      bryntumResource.name = resource.text;
      bryntumResource.eventColor = resource.color;
      bryntumResource.index = index;
      bryntumResourcesData.push(bryntumResource);
      index++;
    }

    for (let appointment of kendoUIAppointmentsData) {
      const bryntumAssignment = {};
      const bryntumEvent = {};

      bryntumAssignment.eventId = appointment.meetingID;
      bryntumAssignment.resourceId = appointment.roomId;

      bryntumEvent.id = appointment.meetingID;
      bryntumEvent.name = appointment.title;
      bryntumEvent.startDate = appointment.start;
      bryntumEvent.endDate = appointment.end;
      bryntumEvent.timeZone = appointment.startTimezone;
      bryntumEvent.recurrenceRule = appointment.recurrenceRule;
      bryntumEvent.exceptionDates = appointment.recurrenceException;
      bryntumEvent.allDay = appointment.isAllDay;

      bryntumAssignmentsData.push(bryntumAssignment);
      bryntumEventsData.push(bryntumEvent);
    }

    // add transformed data to Bryntum database tables
    await sequelize.transaction(async (t) => {
      const resources = await BryntumResource.bulkCreate(bryntumResourcesData, {
        transaction: t,
      });
      const events = await BryntumEvent.bulkCreate(bryntumEventsData, {
        transaction: t,
      });
      const assignments = await BryntumAssignment.bulkCreate(
        bryntumAssignmentsData,
        {
          transaction: t,
        }
      );
      return { resources, assignments, events };
    });

    console.log("Resources, assignments, and events migrated successfully.");
  } catch (error) {
    console.error("Failed to migrate data due to an error: ", error);
  }
}

setupDatabase();
