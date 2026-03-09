const db = require("../config/db");

exports.findAll = async () =>
{
    const [rows] = await db.query("SELECT * FROM PROJECTS");
    return rows;
};

exports.findByType = async (type) =>
{
    const [rows] = await db.query(
        "SELECT * FROM PROJECTS WHERE TYPE = ?",
        [type]
    );

    return rows;
};

exports.findById = async (id) =>
{
    const [rows] = await db.query(
        "SELECT * FROM PROJECTS WHERE ID = ?",
        [id]
    );

    return rows[0];
};