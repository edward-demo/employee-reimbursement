import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  LogOut,
  UserPlus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Pill,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ImageIcon,
  X as XIcon,
  Building2,
  FilterX
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { supabase } from "../../lib/supabase";

interface AdminDashboardProps {
  onLogout: () => void;
}

type ReimbursementCategory = "medicine" | "optical";

interface AdminOverviewCategoryMetrics {
  approved: number;
  pending: number;
  denied: number;
  totalReimbursed: number;
}

type AdminOverviewMetrics = Record<ReimbursementCategory, AdminOverviewCategoryMetrics>;

interface AdminOverviewRequestRow {
  category: ReimbursementCategory;
  status: string;
  current_review_stage: string;
  claim_amount: number | string | null;
}

const adminOverviewErrorMessage = "Unable to retrieve data. Please refresh the page.";

const createEmptyOverviewMetrics = (): AdminOverviewMetrics => ({
  medicine: {
    approved: 0,
    pending: 0,
    denied: 0,
    totalReimbursed: 0
  },
  optical: {
    approved: 0,
    pending: 0,
    denied: 0,
    totalReimbursed: 0
  }
});

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [denialReason, setDenialReason] = useState("duplicate");
  const [customDenialReason, setCustomDenialReason] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ type: 'prescription' | 'receipt', name: string, index?: number } | null>(null);
  const [overviewMetrics, setOverviewMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const admin = {
    name: "Patricia Gonzales",
    id: "EMP-2022-008",
    email: "patricia.gonzales@company.com",
    designation: "HR Manager",
    department: "HR Department",
  };

  const loadReimbursementOverview = useCallback(async () => {
    if (!supabase) {
      setOverviewMetrics(null);
      setOverviewError(adminOverviewErrorMessage);
      setIsOverviewLoading(false);
      return;
    }

    setIsOverviewLoading(true);
    setOverviewError("");

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

      const { data, error } = await supabase
        .from("reimbursement_requests")
        .select("category, status, current_review_stage, claim_amount")
        .gte("submitted_at", monthStart)
        .lt("submitted_at", nextMonthStart)
        .in("category", ["medicine", "optical"])
        .in("status", ["approved", "pending", "denied"]);

      if (error) {
        throw error;
      }

      const nextMetrics = createEmptyOverviewMetrics();

      ((data ?? []) as AdminOverviewRequestRow[]).forEach((request) => {
        const category = request.category;
        if (category !== "medicine" && category !== "optical") {
          return;
        }

        if (request.status === "approved" && request.current_review_stage === "completed") {
          nextMetrics[category].approved += 1;
          nextMetrics[category].totalReimbursed += Number(request.claim_amount ?? 0);
          return;
        }

        if (request.status === "pending" && request.current_review_stage === "hr_admin_review") {
          nextMetrics[category].pending += 1;
          return;
        }

        if (request.status === "denied" && request.current_review_stage === "completed") {
          nextMetrics[category].denied += 1;
        }
      });

      setOverviewMetrics(nextMetrics);
    } catch (error) {
      console.error("Admin reimbursement overview could not be loaded.", error);
      setOverviewMetrics(null);
      setOverviewError(adminOverviewErrorMessage);
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReimbursementOverview();
  }, [loadReimbursementOverview]);

  // Mock data with detailed information
  const stagedPendingRequests = [
    {
      id: "REQ-004",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      department: "Product Development",
      submittedDate: "2024-01-18",
      status: "pending",
      currentReviewStage: "hr_admin_review",
      category: "medicine",
      lineManagerName: "Roberto Cruz",
      prescription: { name: "prescription-004.pdf" },
      medicines: [
        { id: "1", name: "Blood Pressure Medication", quantity: "30", unitPrice: "25.00", subtotal: 750.00 },
        { id: "2", name: "Cholesterol Medication", quantity: "30", unitPrice: "15.00", subtotal: 450.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-004-pharmacy1.pdf",
          invoiceNumber: "INV-2024-001234",
          isPWD: false,
          vatExemption: "",
          pwdDiscount: ""
        }
      ],
      notes: "Regular monthly medication refill",
      totalPrice: 1200.00
    },
    {
      id: "REQ-005",
      employeeName: "Carlos Reyes",
      employeeId: "EMP-2024-003",
      department: "Finance",
      submittedDate: "2024-01-17",
      status: "pending",
      currentReviewStage: "line_manager_review",
      category: "medicine",
      lineManagerName: "Jennifer Lee",
      prescription: { name: "prescription-005.pdf" },
      medicines: [
        { id: "1", name: "Insulin Injections", quantity: "10", unitPrice: "250.00", subtotal: 2500.00 },
        { id: "2", name: "Blood Glucose Test Strips", quantity: "100", unitPrice: "8.00", subtotal: 800.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-005-a.pdf",
          invoiceNumber: "INV-2024-5678",
          isPWD: true,
          vatExemption: "200.00",
          pwdDiscount: "150.00"
        },
        {
          id: "2",
          fileName: "receipt-005-b.pdf",
          invoiceNumber: "INV-2024-5679",
          isPWD: true,
          vatExemption: "100.00",
          pwdDiscount: "50.00"
        }
      ],
      notes: "PWD employee - diabetes care supplies purchased from two pharmacies",
      totalPrice: 2800.00
    }
  ];

  const allRequests = [
    ...stagedPendingRequests,
    {
      id: "REQ-001",
      employeeName: "Juan dela Cruz",
      employeeId: "EMP-2024-001",
      department: "IT Helpdesk",
      submittedDate: "2024-01-15",
      status: "approved",
      category: "medicine",
      approvedBy: "Admin",
      approvedDate: "2024-01-16",
      prescription: { name: "prescription-001.pdf" },
      medicines: [
        { id: "1", name: "Paracetamol 500mg", quantity: "30", unitPrice: "15.00", subtotal: 450.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-001.pdf",
          invoiceNumber: "INV-2024-0001",
          isPWD: false,
          vatExemption: "",
          pwdDiscount: ""
        }
      ],
      notes: "Pain relief medication",
      totalPrice: 450.00,
      remarks: "Approved by HR. Payment processed."
    },
    {
      id: "REQ-006",
      employeeName: "Rosa Mendoza",
      employeeId: "EMP-2024-005",
      department: "Admin",
      submittedDate: "2024-01-12",
      status: "approved",
      category: "medicine",
      approvedBy: "Admin",
      approvedDate: "2024-01-14",
      prescription: { name: "prescription-006.pdf" },
      medicines: [
        { id: "1", name: "Hypertension Medication", quantity: "30", unitPrice: "35.00", subtotal: 1050.00 },
        { id: "2", name: "Multivitamins", quantity: "60", unitPrice: "12.50", subtotal: 750.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-006.pdf",
          invoiceNumber: "INV-2024-8888",
          isPWD: true,
          vatExemption: "150.00",
          pwdDiscount: "90.00"
        }
      ],
      notes: "PWD employee - senior citizen discount applied",
      totalPrice: 1560.00,
      remarks: "Approved with PWD benefits. Payment processed."
    },
    {
      id: "REQ-003",
      employeeName: "Ana Garcia",
      employeeId: "EMP-2024-004",
      department: "HR",
      submittedDate: "2024-01-05",
      status: "denied",
      category: "medicine",
      reviewedBy: "Admin",
      reviewedDate: "2024-01-06",
      prescription: { name: "prescription-003.pdf" },
      medicines: [
        { id: "1", name: "Antibiotic Course", quantity: "21", unitPrice: "40.48", subtotal: 850.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-003.pdf",
          invoiceNumber: "INV-2023-9999",
          isPWD: false,
          vatExemption: "",
          pwdDiscount: ""
        }
      ],
      notes: "",
      totalPrice: 850.00,
      denialReason: "incomplete_details",
      remarks: "Prescription date exceeds allowed timeframe."
    },
    {
      id: "REQ-007",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      department: "Product Development",
      submittedDate: "2024-01-14",
      status: "approved",
      category: "optical",
      approvedBy: "Admin",
      approvedDate: "2024-01-15",
      prescription: { name: "prescription-007.pdf" },
      medicines: [
        { id: "1", name: "Prescription Eyeglasses", quantity: "1", unitPrice: "3500.00", subtotal: 3500.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-007.pdf",
          invoiceNumber: "INV-2024-7777",
          isPWD: false,
          vatExemption: "",
          pwdDiscount: ""
        }
      ],
      notes: "New prescription glasses",
      totalPrice: 3500.00,
      remarks: "Approved by HR. Payment processed."
    },
    {
      id: "REQ-008",
      employeeName: "Carlos Reyes",
      employeeId: "EMP-2024-003",
      department: "Finance",
      submittedDate: "2024-01-10",
      status: "approved",
      category: "optical",
      approvedBy: "Admin",
      approvedDate: "2024-01-11",
      prescription: { name: "prescription-008.pdf" },
      medicines: [
        { id: "1", name: "Contact Lenses", quantity: "6", unitPrice: "450.00", subtotal: 2700.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-008.pdf",
          invoiceNumber: "INV-2024-6666",
          isPWD: false,
          vatExemption: "",
          pwdDiscount: ""
        }
      ],
      notes: "6-month supply of contact lenses",
      totalPrice: 2700.00,
      remarks: "Approved by HR. Payment processed."
    }
  ];


  const getStatusBadge = (status: string, currentReviewStage?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved by HR
        </Badge>;
      case 'pending':
        if (currentReviewStage === "hr_admin_review") {
          return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved by LM • Pending HR Review
          </Badge>;
        }
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Denied
        </Badge>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleApprove = (requestId: string) => {
    console.log("Approving request:", requestId);
    // In real app, this would update the database
    setIsViewDialogOpen(false);
  };

  const handleDeny = (requestId: string) => {
    const finalReason = denialReason === "others" ? customDenialReason : getDenialReasonText(denialReason);
    console.log("Denying request:", requestId, "with reason:", finalReason);
    // In real app, this would update the database
    setIsDenyDialogOpen(false);
    setIsViewDialogOpen(false);
    setDenialReason("duplicate");
    setCustomDenialReason("");
  };

  const getDenialReasonText = (reason: string) => {
    switch (reason) {
      case "duplicate":
        return "Duplicate application - this request has already been submitted";
      case "incomplete_details":
        return "Incomplete details - missing or unclear information in the submission";
      default:
        return "";
    }
  };

  const getTotalPWDDeductions = (receipts: any[]) => {
    return receipts.reduce((total, receipt) => {
      if (!receipt.isPWD) return total;
      const vat = parseFloat(receipt.vatExemption) || 0;
      const discount = parseFloat(receipt.pwdDiscount) || 0;
      return total + vat + discount;
    }, 0);
  };

  const getMedicinesSubtotal = (medicines: any[]) => {
    return medicines.reduce((total, med) => total + med.subtotal, 0);
  };

  const filteredRequests = allRequests.filter(request => {
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "pending_line_manager" && request.status === "pending" && request.currentReviewStage === "line_manager_review") ||
      (filterStatus === "pending_admin" && request.status === "pending" && request.currentReviewStage === "hr_admin_review") ||
      request.status === filterStatus;
    const departmentMatch = filterDepartment === "all" || request.department === filterDepartment;
    return statusMatch && departmentMatch;
  });

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterDepartment("all");
  };

  const hasActiveFilters = filterStatus !== "all" || filterDepartment !== "all";

  // Department statistics for charts (Medicine)
  const departmentStatsMedicine = [
    { department: "Product Development", approvedCount: 5, totalAmount: 8950, color: "#0B8BCB" },
    { department: "Finance", approvedCount: 4, totalAmount: 7500, color: "#62C3F3" },
    { department: "HR", approvedCount: 3, totalAmount: 5800, color: "#B4D3E2" },
    { department: "Admin", approvedCount: 3, totalAmount: 6400, color: "#9333EA" },
    { department: "IT Helpdesk", approvedCount: 2, totalAmount: 3550, color: "#C084FC" },
  ];

  // Department statistics for charts (Optical)
  const departmentStatsOptical = [
    { department: "Product Development", approvedCount: 3, totalAmount: 9500, color: "#0B8BCB" },
    { department: "Finance", approvedCount: 2, totalAmount: 7730, color: "#62C3F3" },
    { department: "HR", approvedCount: 2, totalAmount: 7000, color: "#B4D3E2" },
    { department: "Admin", approvedCount: 1, totalAmount: 2500, color: "#9333EA" },
    { department: "IT Helpdesk", approvedCount: 1, totalAmount: 3000, color: "#C084FC" },
  ];

  const departmentStatsCombined = departmentStatsMedicine.map((medDept, index) => ({
    department: medDept.department,
    medicine: medDept.totalAmount,
    optical: departmentStatsOptical[index].totalAmount
  }));

  const displayedOverviewMetrics = overviewMetrics ?? createEmptyOverviewMetrics();
  const medicineApproved = displayedOverviewMetrics.medicine.approved;
  const medicinePending = displayedOverviewMetrics.medicine.pending;
  const medicineDenied = displayedOverviewMetrics.medicine.denied;

  const opticalApproved = displayedOverviewMetrics.optical.approved;
  const opticalPending = displayedOverviewMetrics.optical.pending;
  const opticalDenied = displayedOverviewMetrics.optical.denied;

  const totalMedicineReimbursed = displayedOverviewMetrics.medicine.totalReimbursed;
  const totalOpticalReimbursed = displayedOverviewMetrics.optical.totalReimbursed;
  const totalReimbursed = totalMedicineReimbursed + totalOpticalReimbursed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2 rounded-lg">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">MedReimburse Admin</h1>
                <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>HR & Finance Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="font-medium">{admin.name}</p>
                <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>{admin.designation}</p>
              </div>
              <Button onClick={onLogout} variant="outline" size="sm" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Requests ({stagedPendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Reports
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reimbursement Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Reimbursement Overview
                  </CardTitle>
                  <CardDescription>Current month statistics by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isOverviewLoading ? (
                    <div className="min-h-[286px] flex items-center justify-center" role="status" aria-live="polite">
                      <p className="text-sm text-muted-foreground">Loading reimbursement data...</p>
                    </div>
                  ) : overviewError ? (
                    <div className="min-h-[286px] flex items-center justify-center text-center" role="alert">
                      <p className="text-sm text-muted-foreground">{overviewError}</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground"></th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Medicine</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-secondary border-l-2 border-gray-200">Optical</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-green-50/30">
                              <td className="py-4 px-4 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span>Approved</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{medicineApproved}</div>
                              </td>
                              <td className="py-4 px-4 text-center border-l-2 border-gray-200">
                                <div className="text-2xl font-bold text-green-600">{opticalApproved}</div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-yellow-50/30">
                              <td className="py-4 px-4 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                  <span>Pending</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{medicinePending}</div>
                              </td>
                              <td className="py-4 px-4 text-center border-l-2 border-gray-200">
                                <div className="text-2xl font-bold text-yellow-600">{opticalPending}</div>
                              </td>
                            </tr>
                            <tr className="hover:bg-red-50/30">
                              <td className="py-4 px-4 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <span>Denied</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{medicineDenied}</div>
                              </td>
                              <td className="py-4 px-4 text-center border-l-2 border-gray-200">
                                <div className="text-2xl font-bold text-red-600">{opticalDenied}</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <Separator />

                      {/* Total Reimbursed by Category */}
                      <div className="p-4 bg-primary/5 rounded-lg space-y-3">
                        <p className="text-sm text-center" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Total Reimbursed This Month</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-xs mb-1" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Medicine</p>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-2xl font-bold text-primary">₱{totalMedicineReimbursed.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs mb-1" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Optical</p>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-2xl font-bold text-secondary">₱{totalOpticalReimbursed.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Department Breakdown Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-secondary" />
                    Department Breakdown
                  </CardTitle>
                  <CardDescription>Approved reimbursements by department and category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentStatsCombined}>
                        <CartesianGrid key="grid-combined" strokeDasharray="3 3" stroke="#B4D3E2" opacity={0.3} />
                        <XAxis
                          key="xaxis-combined"
                          dataKey="department"
                          tick={{ fill: '#0B8BCB', fontSize: 10 }}
                          angle={-15}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis
                          key="yaxis-combined"
                          tick={{ fill: '#0B8BCB', fontSize: 12 }}
                          label={{ value: 'Amount (₱)', angle: -90, position: 'insideLeft', fill: '#0B8BCB' }}
                        />
                        <RechartsTooltip
                          key="tooltip-combined"
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '2px solid #B4D3E2',
                            borderRadius: '8px'
                          }}
                          formatter={(value: any) => [`₱${value.toLocaleString()}`]}
                        />
                        <Legend
                          key="legend-combined"
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="rect"
                        />
                        <Bar
                          key="bar-medicine"
                          dataKey="medicine"
                          name="Medicine"
                          fill="#0B8BCB"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          key="bar-optical"
                          dataKey="optical"
                          name="Optical"
                          fill="#62C3F3"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest reimbursement requests requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stagedPendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                      <div className="flex-1">
                        <h4 className="font-medium">{request.employeeName}</h4>
                        <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                          {request.medicines.length} medicine{request.medicines.length !== 1 ? 's' : ''} • ₱{request.totalPrice} • {request.submittedDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status, request.currentReviewStage)}
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("requests")} style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Reimbursement Requests</h2>
                <p className="text-muted-foreground">Review and manage employee submissions</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_line_manager">Pending LM Review</SelectItem>
                    <SelectItem value="pending_admin">Approved by LM / Pending HR Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Product Development">Product Development</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="IT Helpdesk">IT Helpdesk</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Badge variant="outline" className="border-primary text-primary">
                  {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {filterStatus !== "all" && `Status: ${filterStatus}`}
                  {filterStatus !== "all" && filterDepartment !== "all" && " • "}
                  {filterDepartment !== "all" && `Department: ${filterDepartment}`}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <Card className="border-2 border-dashed border-primary/20">
                  <CardContent className="p-12 text-center">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                    <p className="text-muted-foreground mb-4">
                      No reimbursement requests match your current filters.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <FilterX className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((request) => (
                <Card key={request.id} className="border-2 border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{request.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.employeeId} • {request.department}
                        </p>
                      </div>
                        {getStatusBadge(request.status, request.currentReviewStage)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Medicines</label>
                        <p className="font-medium">{request.medicines.length} item{request.medicines.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Receipts</label>
                        <p>{request.receipts.length} receipt{request.receipts.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Amount</label>
                        <p className="font-semibold text-lg">₱{request.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                        <p>{request.submittedDate}</p>
                      </div>
                    </div>

                    {request.remarks && (
                      <div className="bg-muted/20 p-3 rounded-md mb-4">
                        <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                        <p className="text-sm">{request.remarks}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>

                      {request.status === 'pending' && request.currentReviewStage === 'hr_admin_review' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDenyDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny
                          </Button>

                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )))
              }
            </div>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
              setIsViewDialogOpen(open);
              if (!open) setPreviewDocument(null);
            }}>
              <DialogContent className="w-full sm:min-w-[960px] sm:max-w-[960px] max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Reimbursement Request Details</DialogTitle>
                  <DialogDescription>
                    Complete information for request {selectedRequest?.id}
                  </DialogDescription>
                </DialogHeader>

                {selectedRequest && (
                  <div className="relative">
                    {/* Main Content - scrollable */}
                    <div className={`${previewDocument ? 'sm:grid sm:grid-cols-2 sm:gap-6' : ''} overflow-y-auto max-h-[calc(90vh-120px)]`}>
                      {/* Main Content Column */}
                      <div className="space-y-6">
                    {/* Employee Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Employee Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Name</Label>
                            <p className="font-medium">{selectedRequest.employeeName}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Employee ID</Label>
                            <p className="font-medium">{selectedRequest.employeeId}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Department</Label>
                            <p className="font-medium">{selectedRequest.department}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                            <p className="font-medium">{selectedRequest.submittedDate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                      {/* Documents */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Prescription: {selectedRequest.prescription.name}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setPreviewDocument({ type: 'prescription', name: selectedRequest.prescription.name })}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>

                          {selectedRequest.receipts.map((receipt: any, index: number) => (
                            <div key={receipt.id} className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Receipt className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium">Receipt {index + 1}: {receipt.fileName}</span>
                                  {receipt.isPWD && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">PWD</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="ml-6 text-xs text-muted-foreground">
                                Invoice: {receipt.invoiceNumber}
                              </div>
                              {receipt.isPWD && (parseFloat(receipt.vatExemption) > 0 || parseFloat(receipt.pwdDiscount) > 0) && (
                                <div className="ml-6 text-xs bg-white p-2 rounded border border-green-300">
                                  <div className="flex justify-between">
                                    <span>VAT Exemption:</span>
                                    <span>₱{parseFloat(receipt.vatExemption).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>PWD Discount:</span>
                                    <span>₱{parseFloat(receipt.pwdDiscount).toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex space-x-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => setPreviewDocument({ type: 'receipt', name: receipt.fileName, index })}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                        {/* Medicines */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Medicines Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedRequest.medicines.map((medicine: any, index: number) => (
                              <div key={medicine.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Pill className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium">{index + 1}. {medicine.name}</span>
                                  </div>
                                  <span className="font-semibold">₱{medicine.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="ml-6 text-sm text-muted-foreground">
                                  Quantity: {medicine.quantity} × ₱{medicine.unitPrice}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Financial Summary */}
                      <Card className="border-2 border-secondary/20 bg-secondary/5">
                        <CardHeader>
                          <CardTitle className="text-secondary">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Medicines Subtotal:</span>
                            <span className="font-medium">₱{getMedicinesSubtotal(selectedRequest.medicines).toFixed(2)}</span>
                          </div>

                        {selectedRequest.receipts.some((r: any) => r.isPWD && (parseFloat(r.vatExemption) > 0 || parseFloat(r.pwdDiscount) > 0)) && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">PWD Deductions:</Label>
                              {selectedRequest.receipts.map((receipt: any, index: number) => {
                                if (!receipt.isPWD) return null;
                                const vat = parseFloat(receipt.vatExemption) || 0;
                                const discount = parseFloat(receipt.pwdDiscount) || 0;
                                const total = vat + discount;
                                if (total === 0) return null;

                                return (
                                  <div key={receipt.id} className="flex justify-between items-center text-sm pl-4">
                                    <span className="text-muted-foreground">Receipt {index + 1} ({receipt.invoiceNumber}):</span>
                                    <span className="font-medium text-red-600">-₱{total.toFixed(2)}</span>
                                  </div>
                                );
                              })}
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total PWD Deductions:</span>
                                <span className="font-medium text-red-600">-₱{getTotalPWDDeductions(selectedRequest.receipts).toFixed(2)}</span>
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-medium">Total Reimbursement:</span>
                          <span className="text-2xl font-bold text-secondary">₱{selectedRequest.totalPrice.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>

                      {selectedRequest.notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Additional Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{selectedRequest.notes}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      {selectedRequest.status === 'pending' && selectedRequest.currentReviewStage === 'hr_admin_review' && (
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsViewDialogOpen(false);
                              setIsDenyDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny Request
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(selectedRequest.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Request
                          </Button>
                        </div>
                      )}
                    </div>

                      {/* Preview Column - Desktop (sm and above) */}
                      {previewDocument && (
                        <div className="hidden sm:block sm:border-l sm:pl-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Document Preview</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewDocument(null)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="bg-gray-100 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                              <FileText className="h-16 w-16 mx-auto text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-700">
                                  {previewDocument.type === 'prescription' ? 'Prescription' : `Receipt ${(previewDocument.index || 0) + 1}`}
                                </p>
                                <p className="text-sm text-gray-500">{previewDocument.name}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Preview functionality - In production, this would display the actual document image or PDF
                              </p>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download Document
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-2">Compare with:</p>
                            <div className="space-y-1 pl-3">
                              <p>• Medicine details in the breakdown</p>
                              <p>• Invoice number on receipt</p>
                              <p>• PWD discount amounts (if applicable)</p>
                              <p>• Prescription date and validity</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preview Overlay - Mobile (below sm) */}
                    {previewDocument && (
                      <div className="sm:hidden fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Document Preview</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewDocument(null)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                              <FileText className="h-16 w-16 mx-auto text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-700">
                                  {previewDocument.type === 'prescription' ? 'Prescription' : `Receipt ${(previewDocument.index || 0) + 1}`}
                                </p>
                                <p className="text-sm text-gray-500">{previewDocument.name}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Preview functionality - In production, this would display the actual document image or PDF
                              </p>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download Document
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-2">Compare with:</p>
                            <div className="space-y-1 pl-3">
                              <p>• Medicine details in the breakdown</p>
                              <p>• Invoice number on receipt</p>
                              <p>• PWD discount amounts (if applicable)</p>
                              <p>• Prescription date and validity</p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setPreviewDocument(null)}
                          >
                            Close Preview
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Deny Dialog */}
            <Dialog open={isDenyDialogOpen} onOpenChange={setIsDenyDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deny Reimbursement Request</DialogTitle>
                  <DialogDescription>
                    Please select a reason for denying request {selectedRequest?.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <RadioGroup value={denialReason} onValueChange={setDenialReason}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="duplicate" id="duplicate" />
                      <Label htmlFor="duplicate" className="cursor-pointer">
                        Duplicate Application
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="incomplete_details" id="incomplete_details" />
                      <Label htmlFor="incomplete_details" className="cursor-pointer">
                        Incomplete Details
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="others" id="others" />
                      <Label htmlFor="others" className="cursor-pointer">
                        Others (Specify Reason)
                      </Label>
                    </div>
                  </RadioGroup>

                  {denialReason === "others" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-reason">Custom Reason</Label>
                      <Textarea
                        id="custom-reason"
                        placeholder="Please specify the reason for denial..."
                        rows={3}
                        value={customDenialReason}
                        onChange={(e) => setCustomDenialReason(e.target.value)}
                      />
                    </div>
                  )}

                  {denialReason !== "others" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        {getDenialReasonText(denialReason)}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDenyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => selectedRequest && handleDeny(selectedRequest.id)}
                      disabled={denialReason === "others" && !customDenialReason.trim()}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Deny Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <div>
              <h2 className="text-2xl font-bold">Reports & Analytics</h2>
              <p style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Generate reports and view system analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Monthly Summary
                  </CardTitle>
                  <CardDescription>Generate monthly reimbursement reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOverviewLoading ? (
                    <div className="p-6 text-center" role="status" aria-live="polite">
                      <p className="text-sm text-muted-foreground">Loading reimbursement data...</p>
                    </div>
                  ) : overviewError ? (
                    <div className="p-6 text-center" role="alert">
                      <p className="text-sm text-muted-foreground">{overviewError}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="text-xl font-bold text-primary">₱{totalMedicineReimbursed.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">Medicine</p>
                        </div>
                        <div className="p-4 bg-secondary/5 rounded-lg">
                          <div className="text-xl font-bold text-secondary">₱{totalOpticalReimbursed.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">Optical</p>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg text-center border-t">
                        <div className="text-2xl font-bold">₱{totalReimbursed.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Reimbursed</p>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      View Screenshot
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Department Breakdown
                  </CardTitle>
                  <CardDescription>Reimbursements by department</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {departmentStatsMedicine.map((dept, index) => {
                      const opticalDept = departmentStatsOptical[index];
                      const total = dept.totalAmount + opticalDept.totalAmount;
                      return (
                        <div key={dept.department}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{dept.department}</span>
                            <span className="font-bold">₱{total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground pl-4">
                            <span>Medicine: ₱{dept.totalAmount.toLocaleString()}</span>
                            <span>Optical: ₱{opticalDept.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      View Screenshot
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Full Name</Label>
                    <p className="font-medium">{admin.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Employee ID</Label>
                    <p className="font-medium">{admin.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Designation</Label>
                    <p className="font-medium">{admin.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Department</Label>
                    <p className="font-medium">{admin.department}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Email Address</Label>
                    <p className="font-medium">{admin.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
