const fs = require("fs");
const path = require("path");

// Dashboard uploads live outside public/ (and outside git) so a deploy can never
// wipe them. On the server set UPLOAD_DIR to a folder such as /home/admin/uploads.
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads"));

// Public URL prefix. Falls under /images/ so uploaded paths pass the same
// validation as the images that ship with the site.
const UPLOAD_URL = "/images/uploads";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

module.exports = { UPLOAD_DIR, UPLOAD_URL };
