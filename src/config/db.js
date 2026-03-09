const devMode = process.env.DEV_MODE === "true";

if (devMode)
{
    module.exports = {
        query: async () =>
        {
            throw new Error("Database query attempted while DEV_MODE=true.");
        }
    };

    return;
}

const mysql = require("mysql2/promise");

const pool = mysql.createPool(
{
    host: "localhost",
    user: "root",
    password: "",
    database: "PERSONAL_WEBSITE",
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;