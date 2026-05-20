import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { EmployeeDashboard, type EmployeeDashboardData } from "./components/EmployeeDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { LineManagerDashboard } from "./components/LineManagerDashboard";
import { ReimbursementForm } from "./components/ReimbursementForm";
import { OpticalReimbursementForm } from "./components/OpticalReimbursementForm";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type UserRole = 'employee' | 'admin' | 'line-manager' | null;
type Screen = 'login' | 'employee-dashboard' | 'admin-dashboard' | 'line-manager-dashboard' | 'reimbursement-form' | 'optical-reimbursement-form';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeDashboardData, setEmployeeDashboardData] = useState<EmployeeDashboardData | undefined>();

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

    if (balancesError) {
      throw new Error(balancesError.message);
    }

    const { data: requests, error: requestsError } = await supabase
      .from("reimbursement_requests")
      .select("request_number, category, status, submitted_at, claim_amount, notes")
      .eq("employee_profile_id", employeeProfileId)
      .order("submitted_at", { ascending: false })
      .limit(10);

    if (requestsError) {
      throw new Error(requestsError.message);
    }

    const balanceByCategory = new Map(
      (balances ?? []).map((balance: any) => [
        balance.category,
        {
          annualLimit: Number(balance.annual_limit ?? 0),
          approvedAmount: Number(balance.approved_amount ?? 0)
        }
      ])
    );

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
      reimbursementRequests: (requests ?? []).map((request: any) => ({
        id: request.request_number,
        medicineName: request.category === "optical" ? "Optical Reimbursement" : "Medicine Reimbursement",
        quantity: request.category === "optical" ? "Optical claim" : "Medicine claim",
        totalPrice: Number(request.claim_amount ?? 0),
        submittedDate: request.submitted_at
          ? new Date(request.submitted_at).toLocaleDateString()
          : "",
        status: request.status,
        category: request.category,
        remarks: request.notes ?? ""
      }))
    };
  };

  const handleLogin = async (
    role: Exclude<UserRole, null>,
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
        toast.error(`${role === 'admin' ? 'Admin' : 'Employee'} login failed`, {
          description: signInError.message
        });
        return;
      }

      const { data: appUserId, error: linkError } = await supabase.rpc("ensure_current_supabase_user", {
        p_display_name: null
      });

      if (linkError || !appUserId) {
        toast.error("Employee profile link failed", {
          description: linkError?.message ?? "No app user was returned."
        });
        return;
      }

      if (role === 'admin') {
        try {
          const assignedRoleCodes = await getAssignedRoleCodes(appUserId);
          const isLineManager = await getIsLineManager(appUserId);
          if (!assignedRoleCodes.includes("admin") && !isLineManager) {
            await supabase.auth.signOut();
            throw new Error("Admin access denied. This account must be assigned to Admin access or marked as a line manager.");
          }
        } catch (error) {
          await supabase.auth.signOut();
          throw error instanceof Error ? error : new Error("Admin access could not be checked. Please check the user role setup.");
        }
      }

      try {
        if (role === 'employee') {
          const dashboardData = await loadEmployeeDashboardData(appUserId);
          setEmployeeDashboardData(dashboardData);
        } else {
          setEmployeeDashboardData(undefined);
        }
      } catch (error) {
        await supabase.auth.signOut();
        toast.error("Employee data could not be loaded", {
          description: error instanceof Error ? error.message : "Please check the user profile setup."
        });
        return;
      }
    }

    setUserRole(role);

    if (role === 'employee') {
      setCurrentScreen('employee-dashboard');
      toast.success("Welcome back! You've successfully logged in.", {
        description: "Access your reimbursement requests and submit new claims."
      });
    } else if (role === 'admin') {
      setCurrentScreen('admin-dashboard');
      toast.success("Admin access granted", {
        description: "You can now review and manage employee requests."
      });
    } else if (role === 'line-manager') {
      setCurrentScreen('line-manager-dashboard');
      toast.success("Line Manager access granted", {
        description: "Review and approve team reimbursement requests."
      });
    }
  };

  const handleLogout = () => {
    void supabase?.auth.signOut();
    setUserRole(null);
    setEmployeeDashboardData(undefined);
    setCurrentScreen('login');
    toast.info("You've been signed out");
  };

  const handleNewRequest = () => {
    setCurrentScreen('reimbursement-form');
  };

  const handleNewOpticalRequest = () => {
    setCurrentScreen('optical-reimbursement-form');
  };

  const handleBackToDashboard = () => {
    if (userRole === 'employee') {
      setCurrentScreen('employee-dashboard');
    } else if (userRole === 'admin') {
      setCurrentScreen('admin-dashboard');
    } else if (userRole === 'line-manager') {
      setCurrentScreen('line-manager-dashboard');
    } else {
      setCurrentScreen('login');
    }
  };

  const handleSubmitRequest = () => {
    toast.success("Reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    setCurrentScreen('employee-dashboard');
  };

  const handleSubmitOpticalRequest = () => {
    toast.success("Optical reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    setCurrentScreen('employee-dashboard');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'employee-dashboard' && (
        <EmployeeDashboard
          onLogout={handleLogout}
          onNewRequest={handleNewRequest}
          onNewOpticalRequest={handleNewOpticalRequest}
          dashboardData={employeeDashboardData}
        />
      )}
      
      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}

      {currentScreen === 'line-manager-dashboard' && (
        <LineManagerDashboard onLogout={handleLogout} />
      )}

      {currentScreen === 'reimbursement-form' && (
        <ReimbursementForm
          onBack={handleBackToDashboard}
          onSubmit={handleSubmitRequest}
        />
      )}

      {currentScreen === 'optical-reimbursement-form' && (
        <OpticalReimbursementForm
          onBack={handleBackToDashboard}
          onSubmit={handleSubmitOpticalRequest}
        />
      )}

      <Toaster />
    </div>
  );
}
