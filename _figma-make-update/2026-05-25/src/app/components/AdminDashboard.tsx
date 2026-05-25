import { useState } from "react";
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
  Glasses,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ImageIcon,
  X as XIcon,
  Building2,
  FilterX,
  User
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [denialReason, setDenialReason] = useState("duplicate");
  const [customDenialReason, setCustomDenialReason] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ type: 'prescription' | 'receipt', name: string, index?: number } | null>(null);

  const admin = {
    name: "Patricia Gonzales",
    id: "EMP-2022-008",
    email: "patricia.gonzales@company.com",
    designation: "HR Manager",
    department: "HR Department",
  };

  // Mock data with detailed information
  const pendingRequests = [
    {
      id: "REQ-004",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      employeeEmail: "maria.santos@company.com",
      profilePicture: null,
      department: "Product Development",
      submittedDate: "2026-05-14",
      status: "pending",
      category: "medicine",
      lineManagerName: "Roberto Cruz",
      lineManagerApproved: true,
      prescription: { name: "prescription-004.pdf" },
      medicines: [
        { id: "1", name: "Amlodipine 5mg", quantity: "30", unitPrice: "25.00", subtotal: 750.00, datePurchased: "2024-01-17" },
        { id: "2", name: "Atorvastatin 20mg", quantity: "30", unitPrice: "15.00", subtotal: 450.00, datePurchased: "2024-01-17" }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-004-pharmacy1.pdf",
          invoiceNumber: "INV-2024-001234"
        }
      ],
      notes: "Regular monthly medication refill",
      totalPrice: 1200.00
    },
    {
      id: "REQ-005",
      employeeName: "Carlos Reyes",
      employeeId: "EMP-2024-003",
      employeeEmail: "carlos.reyes@company.com",
      profilePicture: null,
      department: "Finance",
      submittedDate: "2026-05-16",
      status: "pending",
      category: "medicine",
      lineManagerName: "Jennifer Lee",
      lineManagerApproved: false,
      prescription: { name: "prescription-005.pdf" },
      medicines: [
        { id: "1", name: "Lantus Insulin 100 units/ml", quantity: "10", unitPrice: "250.00", subtotal: 2500.00, datePurchased: "2024-01-16" },
        { id: "2", name: "Accu-Chek Test Strips", quantity: "100", unitPrice: "8.00", subtotal: 800.00, datePurchased: "2024-01-16" }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-005-a.pdf",
          invoiceNumber: "INV-2024-5678"
        },
        {
          id: "2",
          fileName: "receipt-005-b.pdf",
          invoiceNumber: "INV-2024-5679"
        }
      ],
      notes: "Diabetes care supplies purchased from two pharmacies",
      totalPrice: 2800.00
    }
  ];

  const allRequests = [
    ...pendingRequests,
    {
      id: "REQ-001",
      employeeName: "Juan dela Cruz",
      employeeId: "EMP-2024-001",
      employeeEmail: "juan.delacruz@company.com",
      profilePicture: null,
      department: "IT Helpdesk",
      submittedDate: "2024-01-15",
      status: "approved",
      category: "medicine",
      lineManagerName: "Roberto Cruz",
      hrFullName: "Patricia Gonzales",
      approvalTimestamp: "2024-01-16 10:30 AM",
      prescription: { name: "prescription-001.pdf" },
      medicines: [
        { id: "1", name: "Paracetamol 500mg", quantity: "30", unitPrice: "15.00", subtotal: 450.00, datePurchased: "2024-01-14" }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-001.pdf",
          invoiceNumber: "INV-2024-0001"
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
      employeeEmail: "rosa.mendoza@company.com",
      profilePicture: null,
      department: "Admin",
      submittedDate: "2024-01-12",
      status: "approved",
      category: "medicine",
      lineManagerName: "Michael Tan",
      hrFullName: "Patricia Gonzales",
      approvalTimestamp: "2024-01-14 2:15 PM",
      prescription: { name: "prescription-006.pdf" },
      medicines: [
        { id: "1", name: "Hypertension Medication", quantity: "30", unitPrice: "35.00", subtotal: 1050.00, datePurchased: "2024-01-11" },
        { id: "2", name: "Multivitamins", quantity: "60", unitPrice: "12.50", subtotal: 750.00, datePurchased: "2024-01-11" }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-006.pdf",
          invoiceNumber: "INV-2024-8888"
        }
      ],
      notes: "Medication refill",
      totalPrice: 1800.00,
      remarks: "Approved by HR. Payment processed."
    },
    {
      id: "REQ-003",
      employeeName: "Ana Garcia",
      employeeId: "EMP-2024-004",
      profilePicture: null,
      department: "HR",
      submittedDate: "2024-01-05",
      status: "denied",
      category: "medicine",
      lineManagerName: "Sarah Johnson",
      hrFullName: "Patricia Gonzales",
      denialTimestamp: "2024-01-06 11:45 AM",
      denialReason: "Prescription date exceeds allowed timeframe",
      prescription: { name: "prescription-003.pdf" },
      medicines: [
        { id: "1", name: "Amoxicillin 500mg", quantity: "21", unitPrice: "40.48", subtotal: 850.00 }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-003.pdf",
          invoiceNumber: "INV-2023-9999"
        }
      ],
      notes: "",
      totalPrice: 850.00,
      remarks: "Prescription date exceeds allowed timeframe."
    },
    {
      id: "REQ-007",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      employeeEmail: "maria.santos@company.com",
      profilePicture: null,
      department: "Product Development",
      submittedDate: "2024-01-14",
      status: "approved",
      category: "optical",
      lineManagerName: "Roberto Cruz",
      hrFullName: "Patricia Gonzales",
      approvalTimestamp: "2024-01-15 9:20 AM",
      prescription: { name: "prescription-007.pdf" },
      medicines: [
        { id: "1", name: "Prescription Eyeglasses", quantity: "1", unitPrice: "3500.00", subtotal: 3500.00, datePurchased: "2024-01-12" }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-007.pdf",
          invoiceNumber: "INV-2024-7777"
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
      employeeEmail: "carlos.reyes@company.com",
      profilePicture: null,
      department: "Finance",
      submittedDate: "2024-01-10",
      status: "approved",
      category: "optical",
      lineManagerName: "Jennifer Lee",
      hrFullName: "Patricia Gonzales",
      approvalTimestamp: "2024-01-11 3:45 PM",
      prescription: { name: "prescription-008.pdf" },
      medicines: [
        { id: "1", name: "Contact Lenses", quantity: "6", unitPrice: "450.00", subtotal: 2700.00, datePurchased: "2024-01-08" }
      ],
      receipts: [
        {
          id: "1",
          fileName: "receipt-008.pdf",
          invoiceNumber: "INV-2024-6666"
        }
      ],
      notes: "6-month supply of contact lenses",
      totalPrice: 2700.00,
      remarks: "Approved by HR. Payment processed."
    }
  ];


  const getStatusBadge = (status: string, lineManagerApproved?: boolean) => {
    if (status === 'approved') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved by HR
      </Badge>;
    }

    if (status === 'pending' && lineManagerApproved) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved by LM • Pending HR Review
      </Badge>;
    }

    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>;
    }

    if (status === 'denied') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Denied
      </Badge>;
    }

    return null;
  };

  const getTypeBadge = (category: string) => {
    switch (category) {
      case 'medicine':
        return <Badge className="bg-purple-100 text-purple-600 border-purple-200">Medicine</Badge>;
      case 'optical':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Optical</Badge>;
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

  const handleApprove = () => {
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    console.log("Approving request:", selectedRequest?.id, "with remarks:", approvalRemarks);
    // In real app, this would update the database
    setIsApproveDialogOpen(false);
    setIsViewDialogOpen(false);
    setApprovalRemarks("");
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


  const getMedicinesSubtotal = (medicines: any[]) => {
    return medicines.reduce((total, med) => total + med.subtotal, 0);
  };

  const filteredRequests = allRequests
    .filter(request => {
      const statusMatch = filterStatus === "all" || request.status === filterStatus;
      const departmentMatch = filterDepartment === "all" || request.department === filterDepartment;
      const typeMatch = filterType === "all" || request.category === filterType;
      const yearMatch = filterYear === "all" || new Date(request.submittedDate).getFullYear().toString() === filterYear;
      return statusMatch && departmentMatch && typeMatch && yearMatch;
    })
    .sort((a, b) => {
      const priority = (r: any) => {
        if (r.status === 'pending' && !r.lineManagerApproved) return 0;
        if (r.status === 'pending' && r.lineManagerApproved) return 1;
        if (r.status === 'approved') return 2;
        return 3;
      };
      const pd = priority(a) - priority(b);
      if (pd !== 0) return pd;
      return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
    });

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterDepartment("all");
    setFilterType("all");
    setFilterYear("all");
  };

  const hasActiveFilters = filterStatus !== "all" || filterDepartment !== "all" || filterType !== "all" || filterYear !== "all";

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

  // Combined department statistics for grouped bar chart
  const departmentStatsCombined = departmentStatsMedicine.map((medDept, index) => ({
    department: medDept.department,
    medicine: medDept.totalAmount,
    optical: departmentStatsOptical[index].totalAmount
  }));

  // Calculate totals for overview
  const medicineApproved = allRequests.filter(r => r.status === 'approved' && r.category === 'medicine').length;
  const medicinePending = allRequests.filter(r => r.status === 'pending' && r.category === 'medicine').length;
  const medicineDenied = allRequests.filter(r => r.status === 'denied' && r.category === 'medicine').length;

  const opticalApproved = allRequests.filter(r => r.status === 'approved' && r.category === 'optical').length;
  const opticalPending = allRequests.filter(r => r.status === 'pending' && r.category === 'optical').length;
  const opticalDenied = allRequests.filter(r => r.status === 'denied' && r.category === 'optical').length;

  const approvedCount = medicineApproved + opticalApproved;
  const deniedCount = medicineDenied + opticalDenied;

  const totalMedicineReimbursed = departmentStatsMedicine.reduce((sum, dept) => sum + dept.totalAmount, 0);
  const totalOpticalReimbursed = departmentStatsOptical.reduce((sum, dept) => sum + dept.totalAmount, 0);
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
                  {admin.name.split(' ').map(n => n[0]).join('')}
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
              Requests ({pendingRequests.length})
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
              <Card className="">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Reimbursement Overview
                  </CardTitle>
                  <CardDescription>Current month statistics by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Compact 2x3 Grid */}
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
                  <div className="p-4 bg-primary/5  rounded-lg space-y-3">
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
                </CardContent>
              </Card>

              {/* Department Breakdown Card */}
              <Card className="">
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

            {/* Pending Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>Latest reimbursement requests requiring attention</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("requests")} style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="flex-1">
                        <h4 className="font-medium">{request.employeeName}</h4>
                        <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                          {request.medicines.length} medicine{request.medicines.length !== 1 ? 's' : ''} • ₱{request.totalPrice} • {request.submittedDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status, request.lineManagerApproved)}
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
          <TabsContent value="requests" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Reimbursement Requests</h2>
                <p style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Review and manage employee submissions</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="optical">Optical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-28 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 p-3 bg-primary/5  rounded-lg">
                <Badge variant="outline" className="border-primary text-primary">
                  {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                </Badge>
                <span className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                  {filterType !== "all" && `Type: ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`}
                  {filterType !== "all" && (filterStatus !== "all" || filterDepartment !== "all" || filterYear !== "all") && " • "}
                  {filterStatus !== "all" && `Status: ${filterStatus}`}
                  {filterStatus !== "all" && (filterDepartment !== "all" || filterYear !== "all") && " • "}
                  {filterDepartment !== "all" && `Department: ${filterDepartment}`}
                  {filterDepartment !== "all" && filterYear !== "all" && " • "}
                  {filterYear !== "all" && `Year: ${filterYear}`}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <Card className="">
                  <CardContent className="p-12 text-center">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                    <p style={{ color: 'rgba(0, 0, 0, 0.72)' }} className="mb-4">
                      No reimbursement requests match your current filters.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                      >
                        <FilterX className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((request) => (
                <Card key={request.id} className={request.category === 'medicine' ? 'border-l-4 border-l-purple-600' : 'border-l-4 border-l-blue-500'}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{request.employeeName}</h3>
                            {getTypeBadge(request.category)}
                          </div>
                          <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                            {request.employeeId} • {request.department}
                          </p>
                      </div>
                      {getStatusBadge(request.status, request.lineManagerApproved)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>
                          {request.category === 'optical' ? 'Total Eye Care' : 'Total Medicines'}
                        </label>
                        <p className="font-medium">{request.medicines.length} item{request.medicines.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Total Receipts</label>
                        <p>{request.receipts.length} receipt{request.receipts.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Amount</label>
                        <p className="font-semibold text-lg">₱{request.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Submitted</label>
                        <p>{request.submittedDate}</p>
                      </div>
                    </div>

                    {request.remarks && (
                      <div className="bg-muted/20 p-3 rounded-md mb-4">
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Remarks</label>
                        <p className="text-sm">{request.remarks}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsViewDialogOpen(true);
                        }}
                        style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>

                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDenyDialogOpen(true);
                            }}
                            style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny Request
                          </Button>

                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRequest(request);
                              handleApprove();
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Request
                          </Button>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsPrintDialogOpen(true);
                          }}
                          style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Print
                        </Button>
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
                            <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Name</Label>
                            <p className="font-medium">{selectedRequest.employeeName}</p>
                          </div>
                          <div>
                            <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Employee ID</Label>
                            <p className="font-medium">{selectedRequest.employeeId}</p>
                          </div>
                          <div>
                            <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Department</Label>
                            <p className="font-medium">{selectedRequest.department}</p>
                          </div>
                          <div>
                            <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Submitted Date</Label>
                            <p className="font-medium">{selectedRequest.submittedDate}</p>
                          </div>
                          {selectedRequest.lineManagerName && (
                            <div className="col-span-2">
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Approved By (Line Manager)</Label>
                              <p className="font-medium">{selectedRequest.lineManagerName}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Approval/Denial Information */}
                    {(selectedRequest.status === 'approved' || selectedRequest.status === 'denied') && (
                      <Card className={selectedRequest.status === 'approved' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {selectedRequest.status === 'approved' ? 'Approval Information' : 'Denial Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>HR Full Name</Label>
                              <p className="font-medium">{selectedRequest.hrFullName}</p>
                            </div>
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>
                                {selectedRequest.status === 'approved' ? 'Approval Date & Time' : 'Denial Date & Time'}
                              </Label>
                              <p className="font-medium">
                                {selectedRequest.status === 'approved' ? selectedRequest.approvalTimestamp : selectedRequest.denialTimestamp}
                              </p>
                            </div>
                            {selectedRequest.status === 'denied' && selectedRequest.denialReason && (
                              <div className="col-span-2">
                                <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Denial Reason</Label>
                                <p className="font-medium text-red-700">{selectedRequest.denialReason}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                      {/* Documents */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="p-3 bg-blue-50  rounded-lg">
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
                                style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>

                          {selectedRequest.receipts.map((receipt: any, index: number) => (
                            <div key={receipt.id} className="p-3 bg-green-50  rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Receipt className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium">Receipt {index + 1}: {receipt.fileName}</span>
                                </div>
                              </div>
                              <div className="ml-6 text-xs" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                                Invoice: {receipt.invoiceNumber}
                              </div>
                              <div className="flex space-x-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => setPreviewDocument({ type: 'receipt', name: receipt.fileName, index })}
                                  style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                        {/* Items Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {selectedRequest.category === 'optical' ? 'Eye Care Details' : 'Medicines Breakdown'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedRequest.medicines.map((medicine: any, index: number) => (
                              <div key={medicine.id} className="p-3 bg-purple-50  rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {selectedRequest.category === 'optical' ? (
                                      <Glasses className="h-4 w-4 text-purple-600" />
                                    ) : (
                                      <Pill className="h-4 w-4 text-purple-600" />
                                    )}
                                    <span className="font-medium">{medicine.name}</span>
                                  </div>
                                  <span className="font-semibold">₱{medicine.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="ml-6 text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                                  Quantity {medicine.quantity} × ₱{medicine.unitPrice}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Financial Summary */}
                      <Card className=" bg-secondary/5">
                        <CardHeader>
                          <CardTitle className="text-secondary">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                              {selectedRequest.category === 'optical' ? 'Eye Care Total:' : 'Medicines Subtotal:'}
                            </span>
                            <span className="font-medium">₱{getMedicinesSubtotal(selectedRequest.medicines).toFixed(2)}</span>
                          </div>

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
                      {selectedRequest.status === 'pending' && (
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setIsViewDialogOpen(false);
                              setIsDenyDialogOpen(true);
                            }}
                            style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny Request
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Request
                          </Button>
                        </div>
                      )}

                      {/* Print Button for Approved Requests */}
                      {selectedRequest.status === 'approved' && (
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="secondary"
                            onClick={() => setIsPrintDialogOpen(true)}
                            style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Print
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
                              <Button variant="outline" size="sm" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Document
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                            <p className="font-medium mb-2">Compare with:</p>
                            <div className="space-y-1 pl-3">
                              <p>• Medicine details in the breakdown</p>
                              <p>• Invoice number on receipt</p>
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
                              <Button variant="outline" size="sm" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Document
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                            <p className="font-medium mb-2">Compare with:</p>
                            <div className="space-y-1 pl-3">
                              <p>• Medicine details in the breakdown</p>
                              <p>• Invoice number on receipt</p>
                              <p>• Prescription date and validity</p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setPreviewDocument(null)}
                            style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
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
                    <div className="p-3 bg-blue-50  rounded-lg">
                      <p className="text-sm text-blue-800">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        {getDenialReasonText(denialReason)}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" onClick={() => setIsDenyDialogOpen(false)} style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
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

            {/* Approve Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Reimbursement Request</DialogTitle>
                  <DialogDescription>
                    Confirm approval for request from {selectedRequest?.employeeName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="p-3 bg-blue-50  rounded-lg">
                    <p className="text-sm text-blue-800">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      Are you sure you want to approve this request? Confirm you have reviewed the prescription, receipts, and details.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approval-remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="approval-remarks"
                      placeholder="Add any remarks or notes for this approval..."
                      rows={3}
                      value={approvalRemarks}
                      onChange={(e) => setApprovalRemarks(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleConfirmApprove}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Print Preview Dialog */}
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
              <DialogContent className="w-full sm:min-w-[800px] sm:max-w-[800px] max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Print Reimbursement Request</DialogTitle>
                  <DialogDescription>
                    Print preview for request {selectedRequest?.id}
                  </DialogDescription>
                </DialogHeader>

                {selectedRequest && (
                  <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <Card className="border-2">
                      <CardContent className="p-8 space-y-6">
                        {/* Header Information */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Requestor ID#</Label>
                              <p className="font-medium">{selectedRequest.employeeId}</p>
                            </div>
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Email Address</Label>
                              <p className="font-medium">{selectedRequest.employeeEmail}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Subject</Label>
                            <p className="font-semibold text-lg">
                              {selectedRequest.category === 'medicine'
                                ? 'Medicine Reimbursement for Meds'
                                : 'Eye Care Reimbursement for Optical'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Date of Request</Label>
                              <p className="font-medium">{selectedRequest.submittedDate}</p>
                            </div>
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Invoice Number</Label>
                              <p className="font-medium">{selectedRequest.receipts[0].invoiceNumber}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Department</Label>
                            <p className="font-medium">{selectedRequest.department}</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Item List */}
                        <div>
                          <Label className="text-sm mb-3 block" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Item List</Label>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-3 font-semibold text-sm">Description</th>
                                  <th className="text-left p-3 font-semibold text-sm">Date Purchased</th>
                                  <th className="text-right p-3 font-semibold text-sm">Amount (₱)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedRequest.medicines.map((item: any, index: number) => (
                                  <tr key={index} className="border-t">
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3">{item.datePurchased}</td>
                                    <td className="p-3 text-right">₱{item.subtotal.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Sub Total */}
                        <div className="flex justify-end">
                          <div className="w-64">
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <span className="font-semibold">Sub Total:</span>
                              <span className="font-bold text-lg">₱{selectedRequest.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Approvals */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Requestor</Label>
                              <p className="font-medium">{selectedRequest.employeeName}</p>
                              <p className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>{selectedRequest.submittedDate}</p>
                            </div>
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>HR Approval</Label>
                              <p className="font-medium">{selectedRequest.hrFullName}</p>
                            </div>
                            <div>
                              <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Line Manager</Label>
                              <p className="font-medium">{selectedRequest.lineManagerName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Note */}
                        <div className="p-3 bg-blue-50  rounded-lg">
                          <p className="text-sm text-blue-800 italic">
                            Note: Digitally approved and signed by Line Manager
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setIsPrintDialogOpen(false)} style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                    Close
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print
                  </Button>
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
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-xl font-bold text-primary">₱{totalMedicineReimbursed.toLocaleString()}</div>
                      <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Medicine</p>
                    </div>
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <div className="text-xl font-bold text-secondary">₱{totalOpticalReimbursed.toLocaleString()}</div>
                      <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Optical</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg text-center border-t">
                    <div className="text-2xl font-bold">₱{totalReimbursed.toLocaleString()}</div>
                    <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Total Reimbursed</p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
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
                          <div className="flex justify-between items-center text-sm pl-4" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                            <span>Medicine: ₱{dept.totalAmount.toLocaleString()}</span>
                            <span>Optical: ₱{opticalDept.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
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
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Full Name</Label>
                    <p className="font-medium">{admin.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Employee ID</Label>
                    <p className="font-medium">{admin.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Designation</Label>
                    <p className="font-medium">{admin.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Department</Label>
                    <p className="font-medium">{admin.department}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Email Address</Label>
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