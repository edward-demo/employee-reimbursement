import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

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
        return [
          line.slice(0, separatorIndex).trim(),
          line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, ""),
        ];
      })
  );
}

const env = {
  ...readEnvFile(".env.local"),
  ...readEnvFile(".env.codex.local"),
  ...process.env,
};

const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing Supabase admin config. Create .env.codex.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function expectedDisplayName(email) {
  const normalizedEmail = email.toLowerCase();
  const emailName = normalizedEmail.split("@")[0];

  const overrides = {
    "financeguy@test123.com": "Finance Guy",
    "hrguy@test123.com": "HR Guy",
    "nurseguy@test123.com": "Nurse Guy",
    "itguy@test123.com": "IT Guy",
    "linemanagerguy@test123.com": "Line Manager Guy",
  };

  if (overrides[normalizedEmail]) return overrides[normalizedEmail];

  return emailName
    .replace(/[._+-]+/g, " ")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function expectedDepartment(email) {
  const normalizedEmail = email.toLowerCase();
  const emailName = normalizedEmail.split("@")[0];

  if (normalizedEmail === "edward.sal365@gmail.com") return "Product Development";
  if (/(product|prod|dev|developer|engineer|software|qa|quality)/.test(emailName)) return "Product Development";
  if (/(finance|accounting|accountant|payroll|billing)/.test(emailName)) return "Finance";
  if (/(^hr$|hr[._+-]|[._+-]hr|human|people|talent)/.test(emailName)) return "HR";
  if (/(it|helpdesk|support|tech|systems|infra)/.test(emailName)) return "IT Helpdesk";
  if (/(admin|operations|ops)/.test(emailName)) return "Admin";
  return "Admin";
}

function expectedIsLineManager(email) {
  const emailName = email.toLowerCase().split("@")[0];
  return /(manager|lead|supervisor|approver)/.test(emailName);
}

function getRelated(rowValue) {
  return Array.isArray(rowValue) ? rowValue[0] : rowValue;
}

async function fetchAllAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    users.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  return users.filter((user) => user.email);
}

async function main() {
  const authUsers = await fetchAllAuthUsers();
  const emails = authUsers.map((user) => user.email.toLowerCase());

  if (emails.length === 0) {
    console.log(JSON.stringify({ checkedAuthUsers: 0, discrepancies: [] }, null, 2));
    return;
  }

  const { data: appUsers, error: appUsersError } = await supabase
    .from("users")
    .select("user_id,email,display_name,status")
    .in("email", emails);
  if (appUsersError) throw appUsersError;

  const userIds = appUsers.map((user) => user.user_id);

  let identityLinks = [];
  let profiles = [];

  if (userIds.length > 0) {
    const { data: identityLinksData, error: identityLinksError } = await supabase
      .from("user_identity_links")
      .select("user_id,identity_provider,external_subject,external_email")
      .in("user_id", userIds);
    if (identityLinksError) throw identityLinksError;
    identityLinks = identityLinksData;

    const { data: profilesData, error: profilesError } = await supabase
      .from("employee_profiles")
      .select("employee_profile_id,user_id,employee_number,full_name,designation,is_line_manager,departments(name)")
      .in("user_id", userIds);
    if (profilesError) throw profilesError;
    profiles = profilesData;
  }

  const profileIds = profiles.map((profile) => profile.employee_profile_id);

  let roleAssignments = [];
  let enrollments = [];
  let pendingRequests = [];

  if (userIds.length > 0) {
    const { data: roleAssignmentsData, error: roleAssignmentsError } = await supabase
      .from("user_roles")
      .select("user_id,roles(code)")
      .in("user_id", userIds);
    if (roleAssignmentsError) throw roleAssignmentsError;
    roleAssignments = roleAssignmentsData;
  }

  if (profileIds.length > 0) {
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from("employee_benefit_enrollments")
      .select("employee_profile_id")
      .in("employee_profile_id", profileIds);
    if (enrollmentsError) throw enrollmentsError;
    enrollments = enrollmentsData;

    const { data: pendingRequestsData, error: pendingRequestsError } = await supabase
      .from("reimbursement_requests")
      .select("employee_profile_id")
      .in("employee_profile_id", profileIds)
      .eq("status", "pending");
    if (pendingRequestsError) throw pendingRequestsError;
    pendingRequests = pendingRequestsData;
  }

  const appUserByEmail = new Map(appUsers.map((user) => [user.email.toLowerCase(), user]));
  const profileByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const identityLinksByUserId = new Map();
  const rolesByUserId = new Map();
  const enrollmentCountByProfileId = new Map();
  const pendingCountByProfileId = new Map();

  for (const link of identityLinks) {
    if (!identityLinksByUserId.has(link.user_id)) identityLinksByUserId.set(link.user_id, []);
    identityLinksByUserId.get(link.user_id).push(link);
  }

  for (const assignment of roleAssignments) {
    const role = getRelated(assignment.roles);
    if (!rolesByUserId.has(assignment.user_id)) rolesByUserId.set(assignment.user_id, new Set());
    if (role?.code) rolesByUserId.get(assignment.user_id).add(role.code);
  }

  for (const enrollment of enrollments) {
    enrollmentCountByProfileId.set(
      enrollment.employee_profile_id,
      (enrollmentCountByProfileId.get(enrollment.employee_profile_id) ?? 0) + 1
    );
  }

  for (const request of pendingRequests) {
    pendingCountByProfileId.set(
      request.employee_profile_id,
      (pendingCountByProfileId.get(request.employee_profile_id) ?? 0) + 1
    );
  }

  const discrepancies = [];

  for (const authUser of authUsers) {
    const email = authUser.email.toLowerCase();
    const appUser = appUserByEmail.get(email);
    const expectedName = expectedDisplayName(email);
    const expectedDept = expectedDepartment(email);
    const expectedManager = expectedIsLineManager(email);

    if (!appUser) {
      discrepancies.push({ email, issue: "missing_app_user", details: { expected: "public.users row exists" } });
      continue;
    }

    const links = identityLinksByUserId.get(appUser.user_id) ?? [];
    const supabaseLink = links.find((link) => link.identity_provider === "supabase");
    const profile = profileByUserId.get(appUser.user_id);
    const roleCodes = rolesByUserId.get(appUser.user_id) ?? new Set();

    if (!supabaseLink) {
      discrepancies.push({ email, issue: "missing_identity_link", details: { expectedSubject: authUser.id } });
    } else if (supabaseLink.external_subject !== authUser.id) {
      discrepancies.push({
        email,
        issue: "wrong_identity_link",
        details: { expectedSubject: authUser.id, actualSubject: supabaseLink.external_subject },
      });
    }

    if (appUser.display_name !== expectedName) {
      discrepancies.push({
        email,
        issue: "display_name_mismatch",
        details: { expected: expectedName, actual: appUser.display_name },
      });
    }

    if (!profile) {
      discrepancies.push({ email, issue: "missing_employee_profile", details: { expected: "employee_profiles row exists" } });
      continue;
    }

    const department = getRelated(profile.departments);

    if (profile.full_name !== expectedName) {
      discrepancies.push({
        email,
        issue: "profile_name_mismatch",
        details: { expected: expectedName, actual: profile.full_name },
      });
    }

    if (department?.name !== expectedDept) {
      discrepancies.push({
        email,
        issue: "department_mismatch",
        details: { expected: expectedDept, actual: department?.name ?? null },
      });
    }

    if (Boolean(profile.is_line_manager) !== expectedManager) {
      discrepancies.push({
        email,
        issue: "line_manager_flag_mismatch",
        details: { expected: expectedManager, actual: Boolean(profile.is_line_manager) },
      });
    }

    if (!roleCodes.has("employee")) {
      discrepancies.push({
        email,
        issue: "missing_employee_role",
        details: { actualRoles: [...roleCodes] },
      });
    }

    if (["Finance", "HR", "Admin"].includes(expectedDept) && !roleCodes.has("admin")) {
      discrepancies.push({
        email,
        issue: "missing_expected_admin_role",
        details: { department: expectedDept, actualRoles: [...roleCodes] },
      });
    }

    if (!["Finance", "HR", "Admin"].includes(expectedDept) && roleCodes.has("admin")) {
      discrepancies.push({
        email,
        issue: "unexpected_admin_role",
        details: { department: expectedDept, actualRoles: [...roleCodes] },
      });
    }

    const enrollmentCount = enrollmentCountByProfileId.get(profile.employee_profile_id) ?? 0;
    if (enrollmentCount < 2) {
      discrepancies.push({
        email,
        issue: "missing_benefit_enrollments",
        details: { expectedMinimum: 2, actualCount: enrollmentCount },
      });
    }

    const pendingCount = pendingCountByProfileId.get(profile.employee_profile_id) ?? 0;
    if (pendingCount > 0) {
      discrepancies.push({
        email,
        issue: "pending_reimbursements_exist",
        details: { pendingCount },
      });
    }
  }

  console.log(JSON.stringify({ checkedAuthUsers: authUsers.length, discrepancies }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
