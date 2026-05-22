import { lazy, Suspense, useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import type { EmployeeDashboardData } from "./components/EmployeeDashboard";
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

function ScreenLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

function SessionRestoringFallback() {
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
        <p className="text-sm text-muted-foreground">Restoring session...</p>

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
  const [lineManagerProfileData, setLineManagerProfileData] = useState<LineManagerProfileData | undefined>();
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const clearAuthenticatedState = () => {
    setUserRole(null);
    setEmployeeDashboardData(undefined);
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

  const loadEmployeeDashboardData = async (appUserId: string): Promise<EmployeeDashboardData> => {
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

    const assignedRoleCodes = await getAssignedRoleCodes(appUserId);

    if (!assignedRoleCodes.includes("employee")) {
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
      .select("request_number, category, status, current_review_stage, submitted_at, claim_amount, notes")
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
        name: (profile as any).full_name,
        id: (profile as any).employee_number,
        designation: (profile as any).designation,
        department: department?.name ?? "Unassigned",
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
      reimbursementRequests: (requests ?? []).map((request: any) => ({
        id: request.request_number,
        medicineName: request.category === "optical" ? "Optical Reimbursement" : "Medicine Reimbursement",
        quantity: request.category === "optical" ? "Optical claim" : "Medicine claim",
        totalPrice: Number(request.claim_amount ?? 0),
        submittedDate: request.submitted_at
          ? new Date(request.submitted_at).toLocaleDateString()
          : "",
        status: request.status,
        lineManagerApproved: request.status === "pending" && request.current_review_stage === "hr_admin_review",
        category: request.category,
        remarks: request.notes ?? ""
      }))
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
      const dashboardData = await loadEmployeeDashboardData(appUserId);
      setEmployeeDashboardData(dashboardData);
      setLineManagerProfileData(undefined);
    } else if (destinationRole === 'line-manager') {
      const profileData = await loadLineManagerProfileData(appUserId);
      setLineManagerProfileData(profileData);
      setEmployeeDashboardData(undefined);
    } else {
      setEmployeeDashboardData(undefined);
      setLineManagerProfileData(undefined);
    }

    setUserRole(destinationRole);
    localStorage.setItem(storedPortalRoleKey, destinationRole);

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
        if (usedAdminLineManagerFallback) {
          toast.info("You do not have Admin access. Redirecting to the Line Manager Dashboard.");
        } else {
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

  const handleSubmitRequest = () => {
    toast.success("Reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    navigate("/employee");
  };

  const handleSubmitOpticalRequest = () => {
    toast.success("Optical reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    navigate("/employee");
  };

  const renderUnauthorizedRedirect = () => (
    <Navigate to={getDefaultAuthenticatedPath(userRole)} replace />
  );

  const renderEmployeeDashboard = () => {
    if (userRole !== 'employee') {
      return renderUnauthorizedRedirect();
    }

    return employeeDashboardData ? (
      <EmployeeDashboard
        onLogout={handleLogout}
        onNewRequest={handleNewRequest}
        onNewOpticalRequest={handleNewOpticalRequest}
        dashboardData={employeeDashboardData}
      />
    ) : (
      <ScreenLoadingFallback />
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
      />
    );
  };

  const renderAdminDashboard = () => {
    if (userRole !== 'admin') {
      return renderUnauthorizedRedirect();
    }

    return <AdminDashboard onLogout={handleLogout} />;
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
      <ScreenLoadingFallback />
    );
  };

  return (
    <div className="min-h-screen">
      {isRestoringSession && (
        <SessionRestoringFallback />
      )}

      {!isRestoringSession && (
        <Suspense fallback={<ScreenLoadingFallback />}>
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
