const crypto = require("crypto");

/*
Single-admin authentication for the dashboard subdomain.

- The password is never stored: DASHBOARD_PASSWORD_HASH holds a scrypt hash made
  by `npm run dashboard:hash`.
- Sessions live in server memory behind a random 256-bit cookie value, so there
  is nothing to forge and a restart simply logs everyone out.
- The dashboard stays off (404) until DASHBOARD_PASSWORD_HASH is set.
*/

const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

const isProduction = () => process.env.NODE_ENV === "production";

// "__Host-" cookies must be Secure, have Path=/ and no Domain, so the browser
// never sends them to joeydriedger.ca itself. They need HTTPS (production only).
const cookieName = () => (isProduction() ? "__Host-dashboard_session" : "dashboard_session");

const sessions = new Map();

function hashPassword(password)
{
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);

    return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function verifyPassword(password, stored)
{
    const parts = String(stored || "").split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt")
    {
        return false;
    }

    const salt = Buffer.from(parts[1], "base64");
    const expected = Buffer.from(parts[2], "base64");

    if (!salt.length || expected.length !== KEY_LENGTH)
    {
        return false;
    }

    const actual = crypto.scryptSync(String(password), salt, KEY_LENGTH, SCRYPT_PARAMS);

    return crypto.timingSafeEqual(actual, expected);
}

function isEnabled()
{
    return String(process.env.DASHBOARD_PASSWORD_HASH || "").startsWith("scrypt$");
}

function parseCookies(header)
{
    const cookies = {};

    String(header || "").split(";").forEach((pair) =>
    {
        const index = pair.indexOf("=");

        if (index > 0)
        {
            cookies[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
        }
    });

    return cookies;
}

function cookieOptions()
{
    return {
        httpOnly: true,
        sameSite: "strict",
        secure: isProduction(),
        path: "/"
    };
}

function purgeExpired(now = Date.now())
{
    for (const [id, session] of sessions)
    {
        if (now - session.lastSeen > IDLE_TIMEOUT_MS || now - session.createdAt > ABSOLUTE_TIMEOUT_MS)
        {
            sessions.delete(id);
        }
    }
}

setInterval(purgeExpired, 5 * 60 * 1000).unref();

// A fresh id is issued at every login, so a pre-login cookie is never reused.
function createSession(res)
{
    const id = crypto.randomBytes(32).toString("hex");
    const now = Date.now();

    sessions.set(id, {
        csrfToken: crypto.randomBytes(32).toString("hex"),
        createdAt: now,
        lastSeen: now
    });

    res.cookie(cookieName(), id, { ...cookieOptions(), maxAge: ABSOLUTE_TIMEOUT_MS });

    return id;
}

function destroySession(req, res)
{
    if (req.dashboardSessionId)
    {
        sessions.delete(req.dashboardSessionId);
    }

    res.clearCookie(cookieName(), cookieOptions());
}

function safeEqual(a, b)
{
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));

    return left.length === right.length && crypto.timingSafeEqual(left, right);
}

// Attaches req.dashboardSession (or null) to every dashboard request.
function loadSession(req, res, next)
{
    const id = parseCookies(req.headers.cookie)[cookieName()];
    const session = id ? sessions.get(id) : null;
    const now = Date.now();

    req.dashboardSession = null;
    req.dashboardSessionId = null;

    if (session)
    {
        if (now - session.lastSeen > IDLE_TIMEOUT_MS || now - session.createdAt > ABSOLUTE_TIMEOUT_MS)
        {
            sessions.delete(id);
        }
        else
        {
            session.lastSeen = now;
            req.dashboardSession = session;
            req.dashboardSessionId = id;
        }
    }

    next();
}

function requireLogin(req, res, next)
{
    if (!req.dashboardSession)
    {
        return res.redirect("/login");
    }

    res.locals.csrfToken = req.dashboardSession.csrfToken;
    next();
}

// Rejects any state-changing request that lacks this session's CSRF token or
// comes from another origin. SameSite=Strict on the cookie is the first layer.
function requireCsrf(req, res, next)
{
    if (["GET", "HEAD", "OPTIONS"].includes(req.method))
    {
        return next();
    }

    const origin = req.get("Origin");

    if (origin && origin !== `${req.protocol}://${req.get("host")}`)
    {
        return res.status(403).send("Forbidden");
    }

    const token = req.body && req.body._csrf;

    if (!req.dashboardSession || typeof token !== "string" || !safeEqual(token, req.dashboardSession.csrfToken))
    {
        return res.status(403).send("Invalid or missing security token. Go back, refresh the page and try again.");
    }

    next();
}

function securityHeaders(req, res, next)
{
    res.set({
        "Cache-Control": "no-store",
        "Content-Security-Policy": [
            "default-src 'none'",
            "script-src 'self'",
            "style-src 'self' https://fonts.googleapis.com",
            "font-src https://fonts.gstatic.com",
            "img-src 'self' https: data:",
            "form-action 'self'",
            "base-uri 'none'",
            "frame-ancestors 'none'"
        ].join("; "),
        "Strict-Transport-Security": "max-age=31536000",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        // Not "no-referrer": that makes browsers send "Origin: null" on form posts,
        // which the CSRF origin check (rightly) refuses.
        "Referrer-Policy": "same-origin",
        "X-Robots-Tag": "noindex, nofollow"
    });

    next();
}

module.exports = {
    hashPassword,
    verifyPassword,
    isEnabled,
    createSession,
    destroySession,
    loadSession,
    requireLogin,
    requireCsrf,
    securityHeaders,
    parseCookies,
    cookieName,
    sessions
};
