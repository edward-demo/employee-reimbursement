import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const ENV_FILES = [".env", ".env.local", ".env.codex.local"];
const TEST_AUTH_USERS = [
  ["adminemp01@test123.com", "63b315fb-8d1a-4f79-be44-32476ab5059a"],
  ["adminemp02@test123.com", "78d88b53-8651-43a0-9cf2-93040386b530"],
  ["adminemp03@test123.com", "99071b09-0275-4cc7-b113-e3b2d0a76743"],
  ["financeemp01@test123.com", "89607ded-fa88-4248-bf72-b797e7c16f69"],
  ["financeemp02@test123.com", "b4b63d3e-1f8f-4c10-9237-2f65639b80d3"],
  ["financeemp03@test123.com", "64c4325b-ba68-4841-936f-5626cd17704a"],
  ["hremp01@test123.com", "5ff43436-4fe5-4c4c-8c61-ebdc2f3d05dd"],
  ["hremp02@test123.com", "306b7b7d-3d02-4040-8a49-01513727e6f9"],
  ["hremp03@test123.com", "073ca9dd-e982-4bc4-a899-70bb0468de15"],
  ["itemp01@test123.com", "84dc2a70-f628-48fa-9f09-ab0518faedb8"],
  ["itemp02@test123.com", "837d936b-e2c3-4421-a811-ec083549cceb"],
  ["itemp03@test123.com", "1d36b3e7-480c-46ad-8e48-a8fe84b84efd"],
  ["proddevemp01@test123.com", "2accd9d2-02b7-4ffe-b184-7919df88a6ad"],
  ["proddevemp02@test123.com", "725642c3-7728-4352-8125-eadcb3c7692e"],
  ["proddevemp03@test123.com", "bc993abf-bf04-4543-8702-86cd1203b2f5"],
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

function isNotFoundError(error) {
  const status = Number(error?.status);
  const message = String(error?.message ?? "").toLowerCase();
  const code = String(error?.code ?? "").toLowerCase();

  return (
    status === 404 ||
    code === "user_not_found" ||
    code === "not_found" ||
    message.includes("user not found") ||
    message.includes("not found")
  );
}

validateAdminConfig();

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function deleteAuthUser(email, userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (!error) {
    console.log(`${email} | ${userId} | deleted`);
    return "deleted";
  }

  if (isNotFoundError(error)) {
    console.log(`${email} | ${userId} | already missing / not found`);
    return "not_found";
  }

  console.error(`${email} | ${userId} | failed`);
  console.error(JSON.stringify(safeAuthErrorDetails(error), null, 2));
  return "failed";
}

async function main() {
  const counts = {
    deleted: 0,
    notFound: 0,
    failed: 0,
  };

  console.log(`Deleting ${TEST_AUTH_USERS.length} test employee Auth account(s) by known user ID.`);

  for (const [email, userId] of TEST_AUTH_USERS) {
    const result = await deleteAuthUser(email, userId);

    if (result === "deleted") counts.deleted += 1;
    else if (result === "not_found") counts.notFound += 1;
    else counts.failed += 1;
  }

  console.log(
    JSON.stringify(
      {
        deleted: counts.deleted,
        alreadyMissingOrNotFound: counts.notFound,
        failed: counts.failed,
      },
      null,
      2
    )
  );

  if (counts.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected failure while deleting test employee Auth account(s).");
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
