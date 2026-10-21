const db = require("../config/db");

/*
Messages sent through the website's contact form. create() is used by the public
form; the rest by the dashboard inbox. All values use "?" placeholders.
*/

const columns = `
    ID AS id,
    NAME AS name,
    EMAIL AS email,
    MESSAGE AS message,
    IS_READ AS isRead,
    CREATED_AT AS createdAt
`;

const normalize = (row) => (row ? { ...row, isRead: Boolean(row.isRead) } : null);

exports.create = async ({ name, email, message }) =>
{
    const [result] = await db.query(
        "INSERT INTO CONTACT_MESSAGES (NAME, EMAIL, MESSAGE) VALUES (?, ?, ?)",
        [name, email, message]
    );

    return result.insertId;
};

exports.list = async (limit = 200) =>
{
    const [rows] = await db.query(
        `SELECT ${columns} FROM CONTACT_MESSAGES ORDER BY CREATED_AT DESC, ID DESC LIMIT ?`,
        [limit]
    );

    return rows.map(normalize);
};

exports.recent = (limit = 5) => exports.list(limit);

exports.get = async (id) =>
{
    const [rows] = await db.query(`SELECT ${columns} FROM CONTACT_MESSAGES WHERE ID = ?`, [id]);

    return normalize(rows[0]);
};

exports.unreadCount = async () =>
{
    const [rows] = await db.query("SELECT COUNT(*) AS n FROM CONTACT_MESSAGES WHERE IS_READ = FALSE");

    return Number(rows[0].n);
};

exports.setRead = async (id, isRead) =>
{
    const [result] = await db.query("UPDATE CONTACT_MESSAGES SET IS_READ = ? WHERE ID = ?", [isRead ? 1 : 0, id]);

    return result.affectedRows > 0;
};

exports.remove = async (id) =>
{
    const [result] = await db.query("DELETE FROM CONTACT_MESSAGES WHERE ID = ?", [id]);

    return result.affectedRows > 0;
};
