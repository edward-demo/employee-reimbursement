import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const ENV_FILES = [".env", ".env.local", ".env.codex.local"];
const PASSWORD = "test123";
const TEST_EMPLOYEE_EMAILS = [
  "adminemp01@test123.com",
  "adminemp02@test123.com",
  "adminemp03@test123.com",
  "financeemp01@test123.com",
  "financeemp02@test123.com",
  "financeemp03@test123.com",
  "hremp01@test123.com",
  "hremp02@test123.com",
  "hremp03@test123.com",
  "itemp01@test123.com",
  "itemp02@test123.com",
  "itemp03@test123.com",
  "proddevemp01@test123.com",
  "proddevemp02@test123.com",
  "proddevemp03@test123.com",
];

function readEnvFile(path) {
  if (!fs.existsSync(path)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) return [line, ""];

        const key = line.slice(0, separatorIndex).trim();
        const value = line
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^"|"$/g, "");

        return [key, value];
      })
  );
}

const env = {
  ...ENV_FILES.reduce((merged, path) => ({ ...merged, ...readEnvFile(path) }), {}),
  ...process.env,
};

const supabaseUrl = env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

function validateAdminConfig() {
  const missingKeys = [];
  if (!supabaseUrl) missingKeys.push("SUPABASE_URL");
  if (!serviceRoleKey) missingKeys.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missingKeys.length > 0) {
    console.error(`Missing required Supabase admin config: ${missingKeys.join(", ")}`);
    console.error("Add the missing value(s) to a local .env file before running this script.");
    process.exit(1);
  }

  console.log("Loaded Supabase admin config: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present.");
}

validateAdminConfig();

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function safeAuthErrorDetails(error) {
  return {
    message: error?.message,
    status: error?.status,
    name: error?.name,
    code: error?.code,
  };
}

function printSafeAuthError(prefix, error) {
  console.error(prefix);
  console.error(JSON.stringify(safeAuthErrorDetails(error), null, 2));
}

function isExistingUserError(error) {
  const message = String(error?.message ?? "").toLowerCase();
  const code = String(error?.code ?? "").toLowerCase();

  return (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already")
  );
}

async function createAuthUser(email) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

async function main() {
  const emailToAuthUserId = {};
  const skippedEmails = [];
  const failedEmails = [];

  for (const email of TEST_EMPLOYEE_EMAILS) {
    const { user, error } = await createAuthUser(email);

    if (!error) {
      emailToAuthUserId[email] = user.id;
      console.log(`${email} -> ${user.id}`);
      continue;
    }

    if (isExistingUserError(error)) {
      skippedEmails.push(email);
      console.log(`Skipped existing user: ${email}`);
      continue;
    }

    failedEmails.push(email);
    printSafeAuthError(`Failed to create Auth user: ${email}`, error);
  }

  if (skippedEmails.length > 0) {
    console.log(`\nSkipped ${skippedEmails.length} existing user(s).`);
  }

  if (Object.keys(emailToAuthUserId).length > 0) {
    console.log("\nCreated email to auth user id mapping:");
    for (const [email, authUserId] of Object.entries(emailToAuthUserId)) {
      console.log(`${email} -> ${authUserId}`);
    }
  }

  if (failedEmails.length > 0) {
    console.error(`\nFailed to create ${failedEmails.length} user(s): ${failedEmails.join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
