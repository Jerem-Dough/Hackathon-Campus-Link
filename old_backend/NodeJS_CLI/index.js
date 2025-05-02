#!/usr/bin/env node

import { program } from "commander";
import pkg from "pg";
const { Pool } = pkg;
import chalk from "chalk";
import { start as mainapp } from "./mainApp.js";
const pool = new Pool({ // establish connection to the docker --> from: https://youtu.be/SfoSVdQJd6w?si=NiQJxtocK3pnJapC
    host: "db", // Uses compose name instead
    port: 5432,
    database: "EXPOS_THANI_WEB",
    user: "postgres",
    password: "TEMP123",
});
async function checkDB(client) {
    // Check if the schema exists/tables exists and that there's things in them
    // we use cliet.query("") followed by an SQL query in the qoutes for database interfacing
    const schemaQuery = "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'program_data')";
    const schemaResult = await client.query(schemaQuery);
    const schemaExists = schemaResult.rows[0].exists;
    console.log("'program_data' schema exists result -->", schemaExists);
    if (!schemaExists) {
        console.log("The 'program_data' schema does not exist. Please create it first, refer to the init.sql!");
        return false;
    }
    return true; // WE ADD CHECKS FOR DB usage here ^ 
}

program
    .version("1.2.0")
    .description("EXPOS_THANI_WEB CLI")
    .option("-n, --name <type>", "Add your name") // can input name (CLI tutorial from  --> https://javascript.plainenglish.io/building-a-cli-with-node-js-in-2024-c278802a3ef5)
    .option("-c, --checkdb <type>", "Check database") // select no to skip checking the database 
    .action(async (options) => {
        let client;
        try {
            console.log(chalk.yellow("program starting..."));
            console.log("Hi ",options.name);
            console.log(chalk.yellow("Attempting to connect to the database..."));
            client = await pool.connect();
            console.log(chalk.green("Successfully connected to the database."));
            if (options.checkdb && (options.checkdb.toLowerCase() === "no" || options.checkdb.toLowerCase() === "false")) {
                console.log("Skipping checkDB...");
            } else {
                const structureOk = await checkDB(client);
                if (!structureOk) {
                    console.log("Checksum for PostGreSQL failed, ensure docker is running and DB/tables are setup!");
                    return;
                }
            }
        } catch (error) {
            console.error("Error details -->", error);
        } finally {
            if (client) {
                console.log(chalk.green("Checks for postgresql DB passed!"));
                console.log(chalk.green("Starting QA app..."));
                // Initialize another .js file as the main app
                await mainapp(client); // Wait for the main app to complete
                client.release(); // release once we are done with the app
            }
        }
    }
);

program.parse(process.argv);