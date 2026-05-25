import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const ENV_FILES = [".env", ".env.local", ".env.codex.local"];
const AUTH_USER_ID = "38a597db-23c1-4ea5-b242-ab742d6d2221";
const EMAIL = "adminlmguy@test123.com";

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
    console.error("Add the missing value(s) to a local env file before running this script.");
    process.exit(1);
  }

  console.log("Loaded Supabase admin config: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present.");
}

function safeAuthErrorDetails(error) {
  return {
    message: error?.message,
    status: error?.status,
    name: error?.name,
    code: error?.code,
  };
}

validateAdminConfig();

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log(`Repairing Supabase Auth user ${AUTH_USER_ID} for ${EMAIL}`);

  const { data, error } = await supabase.auth.admin.updateUserById(AUTH_USER_ID, {
    email: EMAIL,
    password: "test123",
    email_confirm: true,
    user_metadata: {
      display_name: "Admin Line Manager",
      name: "Admin Line Manager",
      email_verified: true,
      department: "Admin",
    },
  });

  if (error) {
    console.error("Failed to repair Supabase Auth user.");
    console.error(JSON.stringify(safeAuthErrorDetails(error), null, 2));
    process.exit(1);
  }

  console.log("Supabase Auth user repaired successfully.");
  console.log(
    JSON.stringify(
      {
        id: data.user?.id,
        email: data.user?.email,
        emailConfirmedAt: data.user?.email_confirmed_at,
        userMetadata: data.user?.user_metadata,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Unexpected failure while repairing Supabase Auth user.");
  console.error(
    JSON.stringify(
      {
        message: error?.message,
        name: error?.name,
      },
      null,
      2
    )
  );
  process.exit(1);
});
