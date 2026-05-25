import { lazy, Suspense, useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import type { EmployeeDashboardData } from "./components/EmployeeDashboard";
import type { AdminProfileData } from "./components/AdminDashboard";
import type { LineManagerProfileData } from "./components/LineManagerDashboard";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const EmployeeDashboard = lazy(() =>
  import("./components/EmployeeDashboard").then((module) => ({ default: module.EmployeeDashboard }))
);
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then((module) => ({ default: module.AdminDashboard }))
);
const LineManagerDashboard = lazy(() =>
  import("./components/LineManagerDashboard").then((module) => ({ default: module.LineManagerDashboard }))
);
const ReimbursementForm = lazy(() =>
  import("./components/ReimbursementForm").then((module) => ({ default: module.ReimbursementForm }))
);
const OpticalReimbursementForm = lazy(() =>
  import("./components/OpticalReimbursementForm").then((module) => ({ default: module.OpticalReimbursementForm }))
);

type UserRole = 'employee' | 'admin' | 'line-manager' | null;
type LoginRole = 'employee' | 'admin';
const loginRoleLabels: Record<LoginRole, string> = {
  employee: "Employee",
  admin: "Admin"
};
const storedPortalRoleKey = "medreimburse.portalRole";
const employeeReimbursementPaths = [
  "/employee/reimbursement/new",
  "/employee/reimbursement/medicine",
  "/employee/reimbursement/optical"
];
const reimbursementDocumentsBucket = "reimbursement-documents";
const initialReviewStage = "line_manager_review";

type ReimbursementCategory = "medicine" | "optical";

interface ReimbursementSubmitItem {
  name: string;
  quantity: string;
  unitPrice: string;
  subtotal: number;
}

interface ReimbursementSubmitReceipt {
  file: File;
  invoiceNumber: string;
}

interface ReimbursementSubmitPayload {
  category: ReimbursementCategory;
  items: ReimbursementSubmitItem[];
  prescriptionFiles: File[];
  receipts: ReimbursementSubmitReceipt[];
  notes: string;
}

const sanitizeStorageFileName = (fileName: string) => (
  fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160) || "document"
);

const getSupportedMimeType = (file: File) => {
  if (["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
    return file.type;
  }

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";

  return "";
};

function ScreenLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

function DashboardSkeletonFallback({ statusMessage }: { statusMessage: string }) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="bg-white border-b-2 border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-lg bg-primary/20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-primary/20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full bg-primary/15" />
              <div className="hidden md:block space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
        role="status"
      >
        <p className="text-sm text-muted-foreground">{statusMessage}</p>

        <div className="grid w-full grid-cols-3 gap-2 rounded-lg border-2 border-primary/10 bg-white p-1">
          <Skeleton className="h-9 rounded-md bg-primary/15" />
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="border-l-4 border-l-primary/30">
              <CardHeader className="pb-3 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-20 bg-primary/15" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <Card>
            <CardHeader className="space-y-3">
              <Skeleton className="h-5 w-36 bg-primary/15" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex items-center gap-4 rounded-lg border border-primary/10 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <Skeleton className="h-5 w-28 bg-primary/15" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SessionRestoringFallback() {
  return <DashboardSkeletonFallback statusMessage="Restoring session..." />;
}

function EmployeeDashboardLoadingFallback() {
  return <DashboardSkeletonFallback statusMessage="Loading employee dashboard..." />;
}

function LineManagerDashboardLoadingFallback({ statusMessage = "Loading dashboard..." }: { statusMessage?: string }) {
  const sidebarCards = [0, 1, 2];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="bg-white border-b-2 border-primary/10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-lg bg-primary/20" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 bg-primary/20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-full bg-primary/15" />
              <div className="hidden md:block space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status">
        <p className="sr-only">{statusMessage}</p>

        <div className="space-y-6">
          <div className="grid w-full grid-cols-2 gap-1 rounded-[20px] bg-white p-[3px]">
            <Skeleton className="h-9 rounded-[20px] bg-primary/20" />
            <Skeleton className="h-9 rounded-[20px]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-primary/15" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full bg-yellow-100" />
                </div>

                <div className="flex flex-col xl:flex-row gap-3">
                  <Skeleton className="h-10 flex-1 rounded-md bg-white" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-10 w-36 rounded-md bg-white" />
                    <Skeleton className="h-10 w-40 rounded-md bg-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-2 border-muted bg-muted/20 shadow-none">
                  <CardContent className="flex min-h-[236px] flex-col items-center justify-center px-6 py-12 text-center sm:p-14">
                    <Skeleton className="mb-5 h-16 w-16 rounded-full bg-white" />
                    <div className="w-full max-w-md space-y-3">
                      <Skeleton className="mx-auto h-5 w-44 bg-primary/15" />
                      <div className="space-y-2">
                        <Skeleton className="mx-auto h-4 w-full" />
                        <Skeleton className="mx-auto h-4 w-4/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {sidebarCards.map((card) => (
                <Card key={card} className={card === 0 ? "border-2 border-yellow-200 bg-yellow-50" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-sm bg-primary/15" />
                      <Skeleton className="h-5 w-32 bg-primary/15" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[0, 1].map((item) => (
                      <div key={item} className="rounded-lg border border-primary/10 bg-white p-3">
                        <div className="flex items-start gap-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeDashboardData, setEmployeeDashboardData] = useState<EmployeeDashboardData | undefined>();
  const [adminProfileData, setAdminProfileData] = useState<AdminProfileData | undefined>();
  const [lineManagerProfileData, setLineManagerProfileData] = useState<LineManagerProfileData | undefined>();
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const clearAuthenticatedState = () => {
    setUserRole(null);
    setEmployeeDashboardData(undefined);
    setAdminProfileData(undefined);
    setLineManagerProfileData(undefined);
    localStorage.removeItem(storedPortalRoleKey);
  };

  const getDashboardPath = (role: Exclude<UserRole, null>) => {
    if (role === 'employee') {
      return "/employee";
    }

    if (role === 'admin') {
      return "/admin";
    }

    return "/line-manager";
  };

  const getDefaultAuthenticatedPath = (role: UserRole) => {
    return role ? getDashboardPath(role) : "/login";
  };

  const isRouteAllowedForRole = (pathname: string, role: Exclude<UserRole, null>) => {
    if (role === 'employee') {
      return pathname === "/employee" || employeeReimbursementPaths.includes(pathname);
    }

    if (role === 'admin') {
      return pathname === "/admin";
    }

    return pathname === "/line-manager";
  };

  const navigateToPermittedRoute = (role: Exclude<UserRole, null>) => {
    const currentPath = location.pathname;

    if (currentPath === "/login" || currentPath === "/" || !isRouteAllowedForRole(currentPath, role)) {
      navigate(getDashboardPath(role), { replace: true });
    }
  };

  const getAssignedRoleCodes = async (appUserId: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", appUserId);

    if (rolesError) {
      throw new Error(rolesError.message);
    }

    return (roles ?? [])
      .map((assignment: any) => {
        const role = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles;
        return role?.code as string | undefined;
      })
      .filter(Boolean);
  };

  const getIsLineManager = async (appUserId: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("employee_profiles")
      .select("is_line_manager")
      .eq("user_id", appUserId)
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "No employee profile is linked to this user.");
    }

    return Boolean((profile as any).is_line_manager);
  };

  const getEmployeeDashboardProfile = async (appUserId: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("employee_profiles")
      .select(`
        employee_profile_id,
        employee_number,
        full_name,
        designation,
        is_line_manager,
        departments(name),
        users(email)
      `)
      .eq("user_id", appUserId)
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "No employee profile is linked to this user.");
    }

    return profile;
  };

  const loadEmployeeDashboardData = async (
    appUserId: string,
    validatedProfile?: Awaited<ReturnType<typeof getEmployeeDashboardProfile>>
  ): Promise<EmployeeDashboardData> => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const profile = validatedProfile ?? await getEmployeeDashboardProfile(appUserId);

    if (!validatedProfile && !(await getAssignedRoleCodes(appUserId)).includes("employee")) {
      throw new Error("This account is not assigned to the Employee portal.");
    }

    const employeeProfileId = (profile as any).employee_profile_id as string;
    const currentYear = new Date().getFullYear();

    const { data: balances, error: balancesError } = await supabase
      .from("employee_benefit_usage")
      .select("category, annual_limit, approved_amount")
      .eq("employee_profile_id", employeeProfileId)
      .eq("plan_year", currentYear);

    const { data: requests, error: requestsError } = await supabase
      .from("reimbursement_requests")
      .select(`
        request_number,
        request_reference_number,
        category,
        status,
        current_review_stage,
        submitted_at,
        claim_amount,
        notes,
        reimbursement_request_items(item_name, sequence_number)
      `)
      .eq("employee_profile_id", employeeProfileId)
      .order("submitted_at", { ascending: false })
      .limit(10);

    const { count: pendingRequestCount, error: pendingRequestCountError } = await supabase
      .from("reimbursement_requests")
      .select("reimbursement_request_id", { count: "exact", head: true })
      .eq("employee_profile_id", employeeProfileId)
      .eq("status", "pending")
      .in("current_review_stage", ["line_manager_review", "hr_admin_review"]);

    const { data: oldestPendingRequests, error: oldestPendingRequestError } = await supabase
      .from("reimbursement_requests")
      .select("submitted_at")
      .eq("employee_profile_id", employeeProfileId)
      .eq("status", "pending")
      .in("current_review_stage", ["line_manager_review", "hr_admin_review"])
      .order("submitted_at", { ascending: true })
      .limit(1);

    const balanceByCategory = new Map(
      (balances ?? []).map((balance: any) => [
        balance.category,
        {
          annualLimit: Number(balance.annual_limit ?? 0),
          approvedAmount: Number(balance.approved_amount ?? 0)
        }
      ])
    );
    const benefitsBalanceError = Boolean(balancesError)
      || !balanceByCategory.has("medicine")
      || !balanceByCategory.has("optical");

    const department = Array.isArray((profile as any).departments)
      ? (profile as any).departments[0]
      : (profile as any).departments;
    const user = Array.isArray((profile as any).users)
      ? (profile as any).users[0]
      : (profile as any).users;

    return {
      employee: {
        employeeProfileId,
        appUserId,
        name: (profile as any).full_name,
        id: (profile as any).employee_number,
        designation: (profile as any).designation,
        department: department?.name ?? "",
        email: user?.email ?? "",
        medicineLimit: balanceByCategory.get("medicine")?.annualLimit ?? 0,
        opticalLimit: balanceByCategory.get("optical")?.annualLimit ?? 0,
        medicineApprovedAmount: balanceByCategory.get("medicine")?.approvedAmount ?? 0,
        opticalApprovedAmount: balanceByCategory.get("optical")?.approvedAmount ?? 0
      },
      benefitsBalanceError,
      pendingRequestCount: pendingRequestCountError ? 0 : pendingRequestCount ?? 0,
      pendingRequestCountError: Boolean(pendingRequestCountError || oldestPendingRequestError),
      oldestPendingRequestDate: oldestPendingRequests?.[0]?.submitted_at
        ? new Date(oldestPendingRequests[0].submitted_at).toLocaleDateString()
        : undefined,
      recentRequestsLoading: false,
      recentRequestsError: Boolean(requestsError),
      reimbursementRequests: (requests ?? []).map((request: any) => {
        const requestItems = [...(request.reimbursement_request_items ?? [])]
          .sort((firstItem: any, secondItem: any) => Number(firstItem.sequence_number ?? 0) - Number(secondItem.sequence_number ?? 0));
        const requestItemNames = requestItems
          .map((item: any) => item.item_name)
          .filter(Boolean)
          .join(", ");
        const fallbackRequestTitle = request.category === "optical"
          ? "Optical Reimbursement"
          : "Medicine Reimbursement";

        return {
          id: request.request_reference_number ?? request.request_number,
          medicineName: requestItemNames || fallbackRequestTitle,
          quantity: request.category === "optical" ? "Optical claim" : "Medicine claim",
          totalPrice: Number(request.claim_amount ?? 0),
          submittedDate: request.submitted_at
            ? new Date(request.submitted_at).toISOString().slice(0, 10)
            : "",
          status: request.status,
          lineManagerApproved: request.status === "pending" && request.current_review_stage === "hr_admin_review",
          category: request.category,
          remarks: request.notes ?? ""
        };
      })
    };
  };

  const loadLineManagerProfileData = async (appUserId: string): Promise<LineManagerProfileData> => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("employee_profiles")
      .select(`
        employee_profile_id,
        full_name,
        designation,
        departments(name)
      `)
      .eq("user_id", appUserId)
      .eq("is_line_manager", true)
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "No line manager profile is linked to this user.");
    }

    const department = Array.isArray((profile as any).departments)
      ? (profile as any).departments[0]
      : (profile as any).departments;

    return {
      employeeProfileId: (profile as any).employee_profile_id,
      name: (profile as any).full_name,
      designation: (profile as any).designation,
      department: department?.name ?? "Unassigned"
    };
  };

  const loadAdminProfileData = async (appUserId: string): Promise<AdminProfileData> => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("employee_profiles")
      .select(`
        employee_number,
        full_name,
        designation,
        departments(name),
        users(email)
      `)
      .eq("user_id", appUserId)
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "No admin profile is linked to this user.");
    }

    const department = Array.isArray((profile as any).departments)
      ? (profile as any).departments[0]
      : (profile as any).departments;
    const user = Array.isArray((profile as any).users)
      ? (profile as any).users[0]
      : (profile as any).users;
    const email = user?.email ?? "";
    const name = (profile as any).full_name?.trim() || email || "Admin User";

    return {
      name,
      id: (profile as any).employee_number?.trim() || "Unassigned",
      designation: (profile as any).designation?.trim() || "Admin",
      department: department?.name ?? "Unassigned",
      email
    };
  };

  const getCurrentAppUserId = async () => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: appUserId, error: linkError } = await supabase.rpc("ensure_current_supabase_user", {
      p_display_name: null
    });

    if (linkError || !appUserId) {
      throw new Error(linkError?.message ?? "No app user was returned.");
    }

    return appUserId as string;
  };

  const getStoredPortalRole = (): Exclude<UserRole, null> | null => {
    const storedRole = localStorage.getItem(storedPortalRoleKey);
    if (storedRole === 'employee' || storedRole === 'admin' || storedRole === 'line-manager') {
      return storedRole;
    }

    return null;
  };

  const getPreferredRoleForPath = (pathname: string): Exclude<UserRole, null> | null => {
    if (pathname === "/employee" || employeeReimbursementPaths.includes(pathname)) {
      return "employee";
    }

    if (pathname === "/admin") {
      return "admin";
    }

    if (pathname === "/line-manager") {
      return "line-manager";
    }

    return null;
  };

  const resolveDestinationRole = async (
    appUserId: string,
    preferredRole?: Exclude<UserRole, null>
  ): Promise<{ destinationRole: Exclude<UserRole, null>; usedAdminLineManagerFallback: boolean }> => {
    const assignedRoleCodes = await getAssignedRoleCodes(appUserId);
    const hasEmployeeAccess = assignedRoleCodes.includes("employee");
    const hasAdminAccess = assignedRoleCodes.includes("admin");
    let isLineManager = false;

    const loadIsLineManager = async () => {
      if (!isLineManager) {
        isLineManager = await getIsLineManager(appUserId);
      }
      return isLineManager;
    };

    if (preferredRole === 'employee') {
      if (!hasEmployeeAccess) {
        throw new Error("This account is not assigned to the Employee portal.");
      }
      return { destinationRole: 'employee', usedAdminLineManagerFallback: false };
    }

    if (preferredRole === 'admin') {
      if (hasAdminAccess) {
        return { destinationRole: 'admin', usedAdminLineManagerFallback: false };
      }

      if (await loadIsLineManager()) {
        return { destinationRole: 'line-manager', usedAdminLineManagerFallback: true };
      }

      throw new Error("Admin access denied. This account must be assigned to Admin access or marked as a line manager.");
    }

    if (preferredRole === 'line-manager') {
      if (await loadIsLineManager()) {
        return { destinationRole: 'line-manager', usedAdminLineManagerFallback: false };
      }

      throw new Error("Line Manager access denied. This account must be marked as a line manager.");
    }

    if (hasAdminAccess) {
      return { destinationRole: 'admin', usedAdminLineManagerFallback: false };
    }

    if (await loadIsLineManager()) {
      return { destinationRole: 'line-manager', usedAdminLineManagerFallback: false };
    }

    if (hasEmployeeAccess) {
      return { destinationRole: 'employee', usedAdminLineManagerFallback: false };
    }

    throw new Error("This account is not assigned to a valid portal.");
  };

  const applyAuthenticatedState = async (
    appUserId: string,
    preferredRole?: Exclude<UserRole, null>
  ) => {
    const { destinationRole, usedAdminLineManagerFallback } = await resolveDestinationRole(appUserId, preferredRole);

    if (destinationRole === 'employee') {
      const employeeProfile = await getEmployeeDashboardProfile(appUserId);
      setEmployeeDashboardData(undefined);
      setAdminProfileData(undefined);
      setLineManagerProfileData(undefined);
      setUserRole(destinationRole);
      localStorage.setItem(storedPortalRoleKey, destinationRole);

      const dashboardData = await loadEmployeeDashboardData(appUserId, employeeProfile);
      setEmployeeDashboardData(dashboardData);
    } else if (destinationRole === 'line-manager') {
      const profileData = await loadLineManagerProfileData(appUserId);
      setLineManagerProfileData(profileData);
      setEmployeeDashboardData(undefined);
      setAdminProfileData(undefined);
      setUserRole(destinationRole);
      localStorage.setItem(storedPortalRoleKey, destinationRole);
    } else {
      const profileData = await loadAdminProfileData(appUserId);
      setAdminProfileData(profileData);
      setEmployeeDashboardData(undefined);
      setLineManagerProfileData(undefined);
      setUserRole(destinationRole);
      localStorage.setItem(storedPortalRoleKey, destinationRole);
    }

    return { destinationRole, usedAdminLineManagerFallback };
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) {
          clearAuthenticatedState();
          setIsRestoringSession(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (!data.session) {
          if (isMounted) {
            clearAuthenticatedState();
            navigate("/login", { replace: true });
          }
          return;
        }

        const appUserId = await getCurrentAppUserId();
        const preferredRole = getPreferredRoleForPath(location.pathname) ?? getStoredPortalRole() ?? undefined;
        const { destinationRole } = await applyAuthenticatedState(appUserId, preferredRole);
        if (isMounted) {
          navigateToPermittedRoute(destinationRole);
        }
      } catch (error) {
        if (isMounted) {
          clearAuthenticatedState();
          navigate("/login", { replace: true });
          toast.error("Session could not be restored", {
            description: error instanceof Error ? error.message : "Please sign in again."
          });
        }
        await supabase?.auth.signOut();
      } finally {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      }
    };

    void restoreSession();

    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_OUT" || !session) && isMounted) {
        clearAuthenticatedState();
        setIsRestoringSession(false);
        navigate("/login", { replace: true });
      }
    }) ?? { data: null };

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (
    role: LoginRole,
    credentials?: { email: string; password: string }
  ) => {
    if (role === 'employee' || role === 'admin') {
      if (!isSupabaseConfigured || !supabase) {
        toast.error("Supabase is not configured", {
          description: "Add your Supabase URL and anon key to the local environment file."
        });
        return;
      }

      if (!credentials?.email || !credentials.password) {
        toast.error("Enter your email and password");
        return;
      }

      await supabase.auth.signOut();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (signInError) {
        toast.error(`${loginRoleLabels[role]} login failed`, {
          description: signInError.message
        });
        return;
      }

      let appUserId: string;
      try {
        appUserId = await getCurrentAppUserId();
      } catch (error) {
        toast.error("Employee profile link failed", {
          description: error instanceof Error ? error.message : "No app user was returned."
        });
        return;
      }

      let destinationRole: Exclude<UserRole, null>;
      let usedAdminLineManagerFallback = false;
      try {
        const restoredState = await applyAuthenticatedState(appUserId, role);
        destinationRole = restoredState.destinationRole;
        usedAdminLineManagerFallback = restoredState.usedAdminLineManagerFallback;
        navigate(getDashboardPath(destinationRole), { replace: true });
      } catch (error) {
        await supabase.auth.signOut();
        clearAuthenticatedState();
        navigate("/login", { replace: true });
        toast.error("Dashboard data could not be loaded", {
          description: error instanceof Error ? error.message : "Please check the user profile setup."
        });
        return;
      }

      if (destinationRole === 'employee') {
        toast.success("Welcome back! You've successfully logged in.", {
          description: "Access your reimbursement requests and submit new claims."
        });
      } else if (destinationRole === 'admin') {
        toast.success("Admin access granted", {
          description: "You can now review and manage employee requests."
        });
      } else if (destinationRole === 'line-manager') {
        if (!usedAdminLineManagerFallback) {
          toast.success("Line Manager access granted", {
            description: "Review and approve team reimbursement requests."
          });
        }
      }
    }
  };

  const handleLogout = () => {
    void supabase?.auth.signOut();
    clearAuthenticatedState();
    navigate("/login", { replace: true });
    toast.info("You've been signed out");
  };

  const handleNewRequest = () => {
    navigate("/employee/reimbursement/medicine");
  };

  const handleNewOpticalRequest = () => {
    navigate("/employee/reimbursement/optical");
  };

  const handleBackToDashboard = () => {
    navigate(getDefaultAuthenticatedPath(userRole));
  };

  const refreshEmployeeDashboardData = async () => {
    const currentEmployee = employeeDashboardData?.employee;

    if (userRole !== "employee" || !currentEmployee?.appUserId) {
      return false;
    }

    setEmployeeDashboardData(undefined);

    try {
      const employeeProfile = await getEmployeeDashboardProfile(currentEmployee.appUserId);
      const dashboardData = await loadEmployeeDashboardData(currentEmployee.appUserId, employeeProfile);
      setEmployeeDashboardData(dashboardData);
      return true;
    } catch (error) {
      console.error("Failed to refresh employee dashboard data", error);
      setEmployeeDashboardData({
        employee: currentEmployee,
        benefitsBalanceError: true,
        pendingRequestCount: 0,
        pendingRequestCountError: true,
        recentRequestsLoading: false,
        recentRequestsError: true,
        reimbursementRequests: []
      });
      return false;
    }
  };

  const submitReimbursementRequest = async (payload: ReimbursementSubmitPayload) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const employee = employeeDashboardData?.employee;
    if (userRole !== "employee" || !employee?.employeeProfileId || !employee?.appUserId) {
      throw new Error("Unable to retrieve data. Please refresh the page.");
    }

    const submittedAt = new Date().toISOString();
    const requestId = crypto.randomUUID();
    const totalAmount = payload.items.reduce((total, item) => total + item.subtotal, 0);
    const notes = payload.notes.trim();

    const { error: requestError } = await supabase
      .from("reimbursement_requests")
      .insert({
        reimbursement_request_id: requestId,
        employee_profile_id: employee.employeeProfileId,
        category: payload.category,
        status: "pending",
        submitted_at: submittedAt,
        employee_confirmed_at: submittedAt,
        item_subtotal_amount: totalAmount,
        pwd_deduction_amount: 0,
        claim_amount: totalAmount,
        notes: notes || null,
        current_review_stage: initialReviewStage
      });

    if (requestError) {
      throw requestError;
    }

    const { error: itemsError } = await supabase
      .from("reimbursement_request_items")
      .insert(payload.items.map((item, index) => ({
        reimbursement_request_id: requestId,
        item_name: item.name.trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.unitPrice),
        subtotal_amount: item.subtotal,
        sequence_number: index + 1
      })));

    if (itemsError) {
      throw itemsError;
    }

    const uploadedDocuments: Array<{
      reimbursement_document_id: string;
      reimbursement_request_id: string;
      document_type: "prescription" | "receipt";
      file_name: string;
      mime_type: string;
      file_size_bytes: number;
      storage_bucket: string;
      storage_path: string;
      uploaded_by_user_id: string;
    }> = [];
    const receiptDocumentIds: string[] = [];

    const uploadDocument = async (
      file: File,
      documentType: "prescription" | "receipt",
      sequenceNumber: number
    ) => {
      const mimeType = getSupportedMimeType(file);
      if (!mimeType) {
        throw new Error(`${file.name} must be a PDF, PNG, JPG, or JPEG file.`);
      }

      const documentId = crypto.randomUUID();
      const storagePath = `${employee.appUserId}/${requestId}/${documentType}/${sequenceNumber}-${sanitizeStorageFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(reimbursementDocumentsBucket)
        .upload(storagePath, file, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      uploadedDocuments.push({
        reimbursement_document_id: documentId,
        reimbursement_request_id: requestId,
        document_type: documentType,
        file_name: file.name,
        mime_type: mimeType,
        file_size_bytes: file.size,
        storage_bucket: reimbursementDocumentsBucket,
        storage_path: storagePath,
        uploaded_by_user_id: employee.appUserId
      });

      return documentId;
    };

    for (const [index, file] of payload.prescriptionFiles.entries()) {
      await uploadDocument(file, "prescription", index + 1);
    }

    for (const [index, receipt] of payload.receipts.entries()) {
      receiptDocumentIds.push(await uploadDocument(receipt.file, "receipt", index + 1));
    }

    const { error: documentsError } = await supabase
      .from("reimbursement_documents")
      .insert(uploadedDocuments);

    if (documentsError) {
      throw documentsError;
    }

    const { error: receiptsError } = await supabase
      .from("reimbursement_receipts")
      .insert(payload.receipts.map((receipt, index) => ({
        reimbursement_request_id: requestId,
        receipt_document_id: receiptDocumentIds[index],
        invoice_number: receipt.invoiceNumber.trim(),
        is_pwd: false,
        vat_exemption_amount: 0,
        pwd_discount_amount: 0,
        sequence_number: index + 1
      })));

    if (receiptsError) {
      throw receiptsError;
    }
  };

  const handleSubmitRequest = async (payload: ReimbursementSubmitPayload) => {
    await submitReimbursementRequest(payload);
    const dashboardRefresh = refreshEmployeeDashboardData();
    toast.success("Reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    navigate("/employee");
    await dashboardRefresh;
  };

  const handleSubmitOpticalRequest = async (payload: ReimbursementSubmitPayload) => {
    await submitReimbursementRequest(payload);
    const dashboardRefresh = refreshEmployeeDashboardData();
    toast.success("Optical reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    navigate("/employee");
    await dashboardRefresh;
  };

  const renderUnauthorizedRedirect = () => (
    <Navigate to={getDefaultAuthenticatedPath(userRole)} replace />
  );

  const renderEmployeeDashboard = () => {
    if (userRole !== 'employee') {
      return renderUnauthorizedRedirect();
    }

    return employeeDashboardData ? (
      <Suspense fallback={<EmployeeDashboardLoadingFallback />}>
        <EmployeeDashboard
          onLogout={handleLogout}
          onNewRequest={handleNewRequest}
          onNewOpticalRequest={handleNewOpticalRequest}
          dashboardData={employeeDashboardData}
        />
      </Suspense>
    ) : (
      <EmployeeDashboardLoadingFallback />
    );
  };

  const renderMedicineReimbursementForm = () => {
    if (userRole !== 'employee') {
      return renderUnauthorizedRedirect();
    }

    return (
      <ReimbursementForm
        onBack={handleBackToDashboard}
        onSubmit={handleSubmitRequest}
        employeeProfile={employeeDashboardData?.employee}
      />
    );
  };

  const renderOpticalReimbursementForm = () => {
    if (userRole !== 'employee') {
      return renderUnauthorizedRedirect();
    }

    return (
      <OpticalReimbursementForm
        onBack={handleBackToDashboard}
        onSubmit={handleSubmitOpticalRequest}
        employeeProfile={employeeDashboardData?.employee}
      />
    );
  };

  const renderAdminDashboard = () => {
    if (userRole !== 'admin') {
      return renderUnauthorizedRedirect();
    }

    if (!adminProfileData) {
      return <EmployeeDashboardLoadingFallback />;
    }

    return <AdminDashboard onLogout={handleLogout} adminProfile={adminProfileData} />;
  };

  const renderLineManagerDashboard = () => {
    if (userRole !== 'line-manager') {
      return renderUnauthorizedRedirect();
    }

    return lineManagerProfileData ? (
      <LineManagerDashboard
        onLogout={handleLogout}
        profileData={lineManagerProfileData}
      />
    ) : (
      <LineManagerDashboardLoadingFallback />
    );
  };

  const routeLoadingFallback = location.pathname === "/line-manager"
    ? <LineManagerDashboardLoadingFallback />
    : <ScreenLoadingFallback />;
  const sessionLoadingFallback = location.pathname === "/line-manager" || localStorage.getItem(storedPortalRoleKey) === "line-manager"
    ? <LineManagerDashboardLoadingFallback statusMessage="Restoring session..." />
    : <SessionRestoringFallback />;

  return (
    <div className="min-h-screen">
      {isRestoringSession && (
        sessionLoadingFallback
      )}

      {!isRestoringSession && (
        <Suspense fallback={routeLoadingFallback}>
          <Routes>
            <Route path="/" element={<Navigate to={getDefaultAuthenticatedPath(userRole)} replace />} />
            <Route path="/login" element={userRole ? <Navigate to={getDashboardPath(userRole)} replace /> : <LoginScreen onLogin={handleLogin} />} />
            <Route path="/employee" element={renderEmployeeDashboard()} />
            <Route path="/employee/reimbursement/new" element={renderMedicineReimbursementForm()} />
            <Route path="/employee/reimbursement/medicine" element={renderMedicineReimbursementForm()} />
            <Route path="/employee/reimbursement/optical" element={renderOpticalReimbursementForm()} />
            <Route path="/admin" element={renderAdminDashboard()} />
            <Route path="/line-manager" element={renderLineManagerDashboard()} />
            <Route path="*" element={<Navigate to={getDefaultAuthenticatedPath(userRole)} replace />} />
          </Routes>
        </Suspense>
      )}

      <Toaster />
    </div>
  );
}
