const db = require("../config/db");

exports.findAll = async () =>
{
    const [rows] = await db.query("SELECT * FROM projects");
    return rows;
};

exports.findByType = async (type) =>
{
    const [rows] = await db.query(
        "SELECT * FROM projects WHERE type = ?",
        [type]
    );

    return rows;
};

exports.findById = async (id) =>
{
    const [rows] = await db.query(
        "SELECT * FROM projects WHERE id = ?",
        [id]
    );

    return rows[0];
};