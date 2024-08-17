import { readFileSync } from "fs";
import sequelize from "./config/database.js";
import { KendoUIAppointment, KendoUIResource } from "./models/index.js";

async function setupDatabase() {
  // Wait for all models to synchronize with the database
  await sequelize.sync();

  // Now add example data
  await addExampleData();
}

async function addExampleData() {
  try {
    // Read and parse the JSON data
    const resourcesData = JSON.parse(
      readFileSync("./initialData/kendouiResources.json")
    );
    const appointmentsData = JSON.parse(
      readFileSync("./initialData/kendouiAppointments.json")
    );

    await sequelize.transaction(async (t) => {
      const resources = await KendoUIResource.bulkCreate(resourcesData, {
        transaction: t,
      });
      const appointments = await KendoUIAppointment.bulkCreate(
        appointmentsData,
        { transaction: t }
      );
      return { resources, appointments };
    });

    console.log(
      "resources and appointments added to database successfully."
    );
  } catch (error) {
    console.error("Failed to add data to database due to an error: ", error);
  }
}

setupDatabase();