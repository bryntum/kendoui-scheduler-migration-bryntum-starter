# Migrate from a Kendo UI for jQuery Scheduler to a Bryntum Scheduler: starter repository

## Getting started 

Install the dependencies:

```bash
npm install
```

The Kendo UI Scheduler for jQuery requires a Kendo UI license file. To get a license file, [sign up for a free trial](https://www.telerik.com/try/kendo-ui) or [login to your Telerik account](https://www.telerik.com/account) if you already have a license or a trial. Note that Telerik and Kendo UI are owned by [Progress](https://www.progress.com/). Once you've logged into your Telerik account, open the [**Get a license file**](https://docs.telerik.com/kendo-ui/intro/installation/using-license-code#1-get-a-license-file) section in the Kendo UI docs. You'll see a red **kendo-ui-license.js** button to download your license file. Save the license file in the `public` folder of this Express starter project. The Express app is configured to serve the static HTML, CSS, and JavaScript files for the Kendo UI Scheduler in the `public` folder.

Create and populate a local SQLite database using [Sequelize](https://sequelize.org/) ORM by running the `addExampleData.js` Node script:

```bash
node addExampleData.js
```

The data models for the Kendo UI Scheduler appointments and resourcs data are in the `models` folder. There are three API endpoints in the `server.js` file for the Kendo UI Scheduler to get data from the local SQLite database and to sync data changes on the client to the database.

Run the development server for this Express app using the following command:

```bash
npm run start
```