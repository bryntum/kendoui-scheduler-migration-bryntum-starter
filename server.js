import express from 'express';
import path from 'path';
import {
    KendoUIAppointment,
    KendoUIResource,
    BryntumAssignment,
    BryntumEvent,
    BryntumResource
} from './models/index.js';

global.__dirname = path.resolve();

const port = 1337;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(
    express.static(path.join(__dirname, '/node_modules/@bryntum/scheduler'))
);
app.use(express.json());
// Middleware to parse application/x-www-form-urlencoded data
app.use(express.urlencoded({ extended : true }));

app.get('/api/appointments/get', async(req, res) => {
    try {
        const appointments = await KendoUIAppointment.findAll();
        res.status(200).json(appointments);
    }
    catch (e) {
        console.error(e);
        res
            .status(500)
            .json({ message : 'There was an error fetching the appointments' });
    }
});

app.post('/api/appointments/sync', async(req, res) => {
    const { created, updated, destroyed } = req.body;
    const returnData = { created : [], updated : [] };
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
                    { ...data, roomId : parseInt(roomId), isAllDay : isAllDay === 'true' },
                    {
                        where : {
                            meetingID : parseInt(meetingID)
                        }
                    }
                );
                const newAppointment = await KendoUIAppointment.findByPk(meetingID);
                returnData.created.push(newAppointment);
            }
        }
        if (destroyed) {
            for (const appointment of destroyed) {
                await KendoUIAppointment.destroy({
                    where : {
                        meetingID : appointment.meetingID
                    }
                });
            }
        }
        res.status(200).json(returnData);
    }
    catch (e) {
        console.error(e);
        res.status(500).json('There was an error syncing the appointment changes');
    }
});

app.get('/api/resources/get', async(req, res) => {
    try {
        const resources = await KendoUIResource.findAll();
        res.status(200).json(resources);
    }
    catch (e) {
        console.error(e);
        res
            .status(500)
            .json({ message : 'There was an error fetching the resources' });
    }
});

app.get('/api/load', async(req, res) => {
    try {
        const resourcesPromise = BryntumResource.findAll({
            order : [['index', 'ASC']]
        });
        const assignmentsPromise = BryntumAssignment.findAll();
        const eventsPromise = BryntumEvent.findAll();
        const [resources, assignments, events] = await Promise.all([
            resourcesPromise,
            assignmentsPromise,
            eventsPromise
        ]);

        res
            .send({
                resources   : { rows : resources },
                assignments : { rows : assignments },
                events      : { rows : events }
            })
            .status(200);
    }
    catch (error) {
        console.error({ error });
        res.send({
            success : false,
            message :
        'There was an error loading the resources, assignments, and events data.'
        });
    }
});

app.post('/api/sync', async function(req, res) {
    const { requestId, assignments, events, resources } = req.body;

    const eventMapping = {};

    try {
        const response = { requestId, success : true };

        if (resources) {
            const rows = await applyTableChanges('resources', resources);
            // if new data to update client
            if (rows) {
                response.resources = { rows };
            }
        }

        if (events) {
            const rows = await applyTableChanges('events', events);
            if (rows) {
                if (events?.added) {
                    rows.forEach((row) => {
                        eventMapping[row.$PhantomId] = row.id;
                    });
                }
                response.events = { rows };
            }
        }

        if (assignments) {
            if (events && events?.added) {
                assignments.added.forEach((assignment) => {
                    assignment.eventId = eventMapping[assignment.eventId];
                });
            }
            const rows = await applyTableChanges('assignments', assignments);
            if (rows) {
                response.assignments = { rows };
            }
        }
        res.send(response);
    }
    catch (error) {
        console.error({ error });
        res.send({
            requestId,
            success : false,
            message : 'There was an error syncing the data changes.'
        });
    }
});

async function applyTableChanges(table, changes) {
    let rows;
    if (changes.added) {
        rows = await createOperation(changes.added, table);
    }
    if (changes.updated) {
        await updateOperation(changes.updated, table);
    }
    if (changes.removed) {
        await deleteOperation(changes.removed, table);
    }
    // if got some new data to update client
    return rows;
}

function createOperation(added, table) {
    return Promise.all(
        added.map(async(record) => {
            const { $PhantomId, ...data } = record;
            let id;
            // Insert record into the table.rows array
            if (table === 'assignments') {
                const assignment = await BryntumAssignment.create(data);
                id = assignment.id;
            }
            if (table === 'events') {
                let { exceptionDates, ...eventData } = data;
                // if exceptionDates is an array, convert it to a comma separated string
                if (Array.isArray(exceptionDates)) {
                    exceptionDates = exceptionDates.join(',');
                }
                const event = await BryntumEvent.create({
                    ...eventData,
                    exceptionDates
                });
                id = event.id;
            }
            if (table === 'resources') {
                // determine index number - add 1 to it
                const maxIndex = await BryntumResource.max('index');
                const resource = await BryntumResource.create({
                    ...data,
                    index : maxIndex + 1
                });
                id = resource.id;
            }
            // report to the client that we changed the record identifier
            return { $PhantomId, id };
        })
    );
}

function deleteOperation(deleted, table) {
    return Promise.all(
        deleted.map(async({ id }) => {
            if (table === 'assignments') {
                await BryntumAssignment.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'events') {
                await BryntumEvent.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'resources') {
                await BryntumResource.destroy({
                    where : {
                        id : id
                    }
                });
            }
        })
    );
}

function updateOperation(updated, table) {
    return Promise.all(
        updated.map(async({ id, ...data }) => {
            if (table === 'assignments') {
                await BryntumAssignment.update(data, { where : { id } });
            }
            if (table === 'events') {
                let { exceptionDates, ...eventData } = data;
                // if exceptionDates is an array, convert it to a comma separated string
                if (Array.isArray(exceptionDates)) {
                    exceptionDates = exceptionDates.join(',');
                }
                await BryntumEvent.update(
                    { ...eventData, exceptionDates },
                    { where : { id } }
                );
            }
            if (table === 'resources') {
                await BryntumResource.update(data, { where : { id } });
            }
        })
    );
}

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
