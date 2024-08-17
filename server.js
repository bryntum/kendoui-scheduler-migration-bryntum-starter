import express from "express";
import path from "path";
import {
  KendoUIAppointment,
  KendoUIResource,
} from "./models/index.js";

global.__dirname = path.resolve();

const port = 1337;
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
// Middleware to parse application/x-www-form-urlencoded data
app.use(express.urlencoded({ extended: true }));

app.get("/api/appointments/get", async (req, res) => {
  try {
    const appointments = await KendoUIAppointment.findAll();
    res.status(200).json(appointments);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "There was an error fetching the appointments" });
  }
});

app.post("/api/appointments/sync", async (req, res) => {
  const { created, updated, destroyed } = req.body;
  const returnData = { created: [], updated: [] };
  try {
    if (created) {
      for (const appointment of created) {
        const { meetingID, ...data } = appointment;
        const newAppointment = await KendoUIAppointment.create(data);
        returnData.created.push(newAppointment);
      }
    }
    if (updated) {
      for (const appointment of updated) {
        const { meetingID, roomId, isAllDay, ...data } = appointment;
        await KendoUIAppointment.update(
          { ...data, roomId: parseInt(roomId), isAllDay: isAllDay === "true" },
          {
            where: {
              meetingID: parseInt(meetingID),
            },
          }
        );
        const newAppointment = await KendoUIAppointment.findByPk(meetingID);
        returnData.created.push(newAppointment);
      }
    }
    if (destroyed) {
      for (const appointment of destroyed) {
        await KendoUIAppointment.destroy({
          where: {
            meetingID: appointment.meetingID,
          },
        });
      }
    }
    res.status(200).json(returnData);
  } catch (e) {
    console.error(e);
    res.status(500).json("There was an error syncing the appointment changes");
  }
});

app.get("/api/resources/get", async (req, res) => {
  try {
    const resources = await KendoUIResource.findAll();
    res.status(200).json(resources);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "There was an error fetching the resources" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
