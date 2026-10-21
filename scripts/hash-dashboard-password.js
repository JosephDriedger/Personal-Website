// Usage: npm run dashboard:hash
// Prompts for a password (hidden) and prints the DASHBOARD_PASSWORD_HASH line for .env.
const { hashPassword } = require("../src/dashboard/auth");

function readHidden(prompt)
{
    return new Promise((resolve) =>
    {
        process.stdout.write(prompt);

        const stdin = process.stdin;
        let value = "";

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const onData = (chunk) =>
        {
            for (const char of chunk)
            {
                if (char === "\r" || char === "\n" || char === "\u0004")
                {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdin.removeListener("data", onData);
                    process.stdout.write("\n");
                    resolve(value);
                    return;
                }

                if (char === "\u0003")
                {
                    process.exit(1);
                }

                if (char === "\u007f" || char === "\b")
                {
                    value = value.slice(0, -1);
                }
                else
                {
                    value += char;
                }
            }
        };

        stdin.on("data", onData);
    });
}

(async () =>
{
    if (!process.stdin.isTTY)
    {
        console.error("Run this in an interactive terminal.");
        process.exit(1);
    }

    const password = await readHidden("New dashboard password (min 12 characters): ");

    if (password.length < 12)
    {
        console.error("Password must be at least 12 characters.");
        process.exit(1);
    }

    const confirm = await readHidden("Repeat password: ");

    if (confirm !== password)
    {
        console.error("Passwords do not match.");
        process.exit(1);
    }

    console.log("\nAdd this line to the server's .env, then restart the app:\n");
    console.log(`DASHBOARD_PASSWORD_HASH='${hashPassword(password)}'`);
})();
