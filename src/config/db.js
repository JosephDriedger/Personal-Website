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
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "PERSONAL_WEBSITE",
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;