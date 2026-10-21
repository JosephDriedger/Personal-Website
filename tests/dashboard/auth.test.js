const test = require("node:test");
const assert = require("node:assert");

const auth = require("../../src/dashboard/auth");

test("password hashes verify only the right password", () =>
{
    const stored = auth.hashPassword("correct horse battery");

    assert.ok(stored.startsWith("scrypt$"));
    assert.strictEqual(auth.verifyPassword("correct horse battery", stored), true);
    assert.strictEqual(auth.verifyPassword("wrong password", stored), false);
    assert.strictEqual(auth.verifyPassword("", stored), false);
});

test("the same password hashes differently each time (random salt)", () =>
{
    assert.notStrictEqual(auth.hashPassword("same password 123"), auth.hashPassword("same password 123"));
});

test("malformed stored hashes never verify", () =>
{
    for (const stored of ["", undefined, "plaintext", "scrypt$$", "scrypt$abc$def", "md5$a$b"])
    {
        assert.strictEqual(auth.verifyPassword("anything", stored), false);
    }
});

test("dashboard stays disabled without a configured hash", () =>
{
    const saved = process.env.DASHBOARD_PASSWORD_HASH;

    delete process.env.DASHBOARD_PASSWORD_HASH;
    assert.strictEqual(auth.isEnabled(), false);

    process.env.DASHBOARD_PASSWORD_HASH = "not-a-hash";
    assert.strictEqual(auth.isEnabled(), false);

    process.env.DASHBOARD_PASSWORD_HASH = auth.hashPassword("a long enough password");
    assert.strictEqual(auth.isEnabled(), true);

    if (saved === undefined) delete process.env.DASHBOARD_PASSWORD_HASH;
    else process.env.DASHBOARD_PASSWORD_HASH = saved;
});

test("security headers lock the page down and keep same-origin Origin headers working", () =>
{
    const headers = {};

    auth.securityHeaders({}, { set: (values) => Object.assign(headers, values) }, () => {});

    assert.match(headers["Content-Security-Policy"], /default-src 'none'/);
    assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
    assert.strictEqual(headers["X-Frame-Options"], "DENY");
    // "no-referrer" makes browsers send "Origin: null" on form posts, which would break every save.
    assert.strictEqual(headers["Referrer-Policy"], "same-origin");
});

test("CSRF check rejects missing/wrong tokens and foreign origins", () =>
{
    const run = (req) =>
    {
        const result = { status: null, nexted: false };
        const res = { status(code) { result.status = code; return this; }, send() { return this; } };

        auth.requireCsrf(
            { get: (name) => req.headers[name.toLowerCase()], protocol: "https", ...req },
            res,
            () => { result.nexted = true; }
        );

        return result;
    };

    const session = { csrfToken: "a".repeat(64) };
    const base = { method: "POST", headers: { host: "dashboard.example.com" }, dashboardSession: session };
    const withHost = (headers) => ({ ...base, headers: { host: "dashboard.example.com", ...headers } });

    assert.strictEqual(run({ ...base, body: { _csrf: session.csrfToken } }).nexted, true);
    assert.strictEqual(run({ ...base, body: {} }).status, 403);
    assert.strictEqual(run({ ...base, body: { _csrf: "b".repeat(64) } }).status, 403);
    assert.strictEqual(run({ ...base, body: { _csrf: ["x"] } }).status, 403);
    assert.strictEqual(run({ ...base, dashboardSession: null, body: { _csrf: session.csrfToken } }).status, 403);
    assert.strictEqual(run({ ...withHost({ origin: "https://evil.example" }), body: { _csrf: session.csrfToken } }).status, 403);
    assert.strictEqual(run({ ...withHost({ origin: "https://dashboard.example.com" }), body: { _csrf: session.csrfToken } }).nexted, true);
    assert.strictEqual(run({ ...base, method: "GET", body: {} }).nexted, true);
});
