const db = require("../config/db");

exports.findAll = async () =>
{
    const [rows] = await db.query(
        "SELECT * FROM videos ORDER BY created_at DESC"
    );

    return rows;
};
