const db = require("../config/db");

/*
Write-side queries for the dashboard. Every value goes through a "?" placeholder;
nothing from a request is ever concatenated into SQL.
*/

const projectColumns = `
    ID AS id,
    TITLE AS title,
    SLUG AS slug,
    SHORT_DESCRIPTION AS shortDescription,
    DESCRIPTION AS description,
    CATEGORY AS category,
    TYPE AS type,
    ROLE AS role,
    STATUS AS status,
    DATE_FORMAT(START_DATE, '%Y-%m-%d') AS startDate,
    DATE_FORMAT(END_DATE, '%Y-%m-%d') AS endDate,
    GITHUB_URL AS github,
    DEMO_URL AS demo,
    WEBSITE_URL AS website,
    IMAGE_URL AS image,
    THUMBNAIL_URL AS thumbnail,
    IS_FEATURED AS isFeatured,
    DISPLAY_ORDER AS displayOrder,
    UPDATED_AT AS updatedAt
`;

function projectParams(values)
{
    return [
        values.title,
        values.slug,
        values.shortDescription || null,
        values.description || null,
        values.category,
        values.type,
        values.role || null,
        values.status,
        values.startDate || null,
        values.endDate || null,
        values.github || null,
        values.demo || null,
        values.website || null,
        values.image || null,
        values.thumbnail || null,
        values.isFeatured ? 1 : 0,
        values.displayOrder
    ];
}

async function replaceChildren(connection, projectId, values)
{
    await connection.query("DELETE FROM PROJECT_TECH WHERE PROJECT_ID = ?", [projectId]);
    await connection.query("DELETE FROM PROJECT_MEDIA WHERE PROJECT_ID = ?", [projectId]);

    for (let index = 0; index < values.technologies.length; index += 1)
    {
        await connection.query(
            "INSERT INTO PROJECT_TECH (PROJECT_ID, TECH_NAME, DISPLAY_ORDER) VALUES (?, ?, ?)",
            [projectId, values.technologies[index], index]
        );
    }

    for (let index = 0; index < values.media.length; index += 1)
    {
        const item = values.media[index];

        await connection.query(
            `INSERT INTO PROJECT_MEDIA (PROJECT_ID, MEDIA_TYPE, TITLE, URL, THUMBNAIL_URL, DISPLAY_ORDER)
             VALUES (?, 'Image', ?, ?, ?, ?)`,
            [projectId, item.title, item.url, item.thumbnail, index]
        );
    }
}

async function inTransaction(work)
{
    const connection = await db.getConnection();

    try
    {
        await connection.beginTransaction();
        const result = await work(connection);
        await connection.commit();

        return result;
    }
    catch (error)
    {
        await connection.rollback();
        throw error;
    }
    finally
    {
        connection.release();
    }
}

exports.isDuplicate = (error) => Boolean(error && error.code === "ER_DUP_ENTRY");

exports.listProjects = async () =>
{
    const [rows] = await db.query(`
        SELECT ${projectColumns}
        FROM PROJECTS
        ORDER BY (STATUS = 'In-Progress') ASC, COALESCE(END_DATE, START_DATE) DESC, ID DESC
    `);

    return rows;
};

exports.getProject = async (id) =>
{
    const [rows] = await db.query(`SELECT ${projectColumns} FROM PROJECTS WHERE ID = ?`, [id]);

    if (!rows[0])
    {
        return null;
    }

    const [tech] = await db.query(
        "SELECT TECH_NAME AS name FROM PROJECT_TECH WHERE PROJECT_ID = ? ORDER BY DISPLAY_ORDER ASC, ID ASC",
        [id]
    );

    const [media] = await db.query(
        `SELECT TITLE AS title, URL AS url, THUMBNAIL_URL AS thumbnail
         FROM PROJECT_MEDIA WHERE PROJECT_ID = ? ORDER BY DISPLAY_ORDER ASC, ID ASC`,
        [id]
    );

    return {
        ...rows[0],
        isFeatured: Boolean(rows[0].isFeatured),
        technologies: tech.map((row) => row.name),
        media
    };
};

exports.createProject = (values) => inTransaction(async (connection) =>
{
    const [result] = await connection.query(
        `INSERT INTO PROJECTS
            (TITLE, SLUG, SHORT_DESCRIPTION, DESCRIPTION, CATEGORY, TYPE, ROLE, STATUS,
             START_DATE, END_DATE, GITHUB_URL, DEMO_URL, WEBSITE_URL, IMAGE_URL, THUMBNAIL_URL,
             IS_FEATURED, DISPLAY_ORDER)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        projectParams(values)
    );

    await replaceChildren(connection, result.insertId, values);

    return result.insertId;
});

exports.updateProject = (id, values) => inTransaction(async (connection) =>
{
    const [result] = await connection.query(
        `UPDATE PROJECTS SET
            TITLE = ?, SLUG = ?, SHORT_DESCRIPTION = ?, DESCRIPTION = ?, CATEGORY = ?, TYPE = ?,
            ROLE = ?, STATUS = ?, START_DATE = ?, END_DATE = ?, GITHUB_URL = ?, DEMO_URL = ?,
            WEBSITE_URL = ?, IMAGE_URL = ?, THUMBNAIL_URL = ?, IS_FEATURED = ?, DISPLAY_ORDER = ?
         WHERE ID = ?`,
        [...projectParams(values), id]
    );

    if (result.affectedRows === 0)
    {
        return false;
    }

    await replaceChildren(connection, id, values);

    return true;
});

// PROJECT_TECH and PROJECT_MEDIA rows go with it (ON DELETE CASCADE).
exports.deleteProject = async (id) =>
{
    const [result] = await db.query("DELETE FROM PROJECTS WHERE ID = ?", [id]);

    return result.affectedRows > 0;
};

exports.listVideos = async () =>
{
    const [rows] = await db.query(`
        SELECT ID AS id, TITLE AS title, VIDEO_ID AS videoId, CREATED_AT AS createdAt
        FROM VIDEOS
        ORDER BY CREATED_AT DESC, ID DESC
    `);

    return rows;
};

exports.createVideo = async ({ title, videoId }) =>
{
    const [result] = await db.query(
        "INSERT INTO VIDEOS (TITLE, VIDEO_ID) VALUES (?, ?)",
        [title, videoId]
    );

    return result.insertId;
};

exports.updateVideo = async (id, { title, videoId }) =>
{
    const [result] = await db.query(
        "UPDATE VIDEOS SET TITLE = ?, VIDEO_ID = ? WHERE ID = ?",
        [title, videoId, id]
    );

    return result.affectedRows > 0;
};

exports.deleteVideo = async (id) =>
{
    const [result] = await db.query("DELETE FROM VIDEOS WHERE ID = ?", [id]);

    return result.affectedRows > 0;
};
