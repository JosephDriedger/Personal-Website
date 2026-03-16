const mysql = require("mysql2/promise");

const isDevelopment = process.env.NODE_ENV === "development";
const allowDevDb = process.env.ALLOW_DEV_DB === "true";

if (isDevelopment && !allowDevDb)
{
    module.exports = {
        query: async () =>
        {
            throw new Error(
                "Database query attempted while NODE_ENV=development and ALLOW_DEV_DB is not true."
            );
        }
    };

    return;
}

const pool = mysql.createPool(
{
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "PERSONAL_WEBSITE",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;