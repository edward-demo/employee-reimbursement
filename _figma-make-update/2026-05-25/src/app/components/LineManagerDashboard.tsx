import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  Receipt,
  TrendingUp,
  AlertCircle,
  Bell,
  Search,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Filter,
  ChevronRight,
  Download,
  FilterX,
  Pill,
  Glasses,
  X as XIcon
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface LineManagerDashboardProps {
  onLogout: () => void;
}

export function LineManagerDashboard({ onLogout }: LineManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [denialReason, setDenialReason] = useState("duplicate");
  const [customDenialReason, setCustomDenialReason] = useState("");
  const [previewDocument, setPreviewDocument] = useState<{ type: 'prescription' | 'receipt', name: string, index?: number } | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const manager = {
    name: "Roberto Cruz",
    id: "EMP-2023-015",
    email: "roberto.cruz@company.com",
    designation: "Engineering Manager",
    department: "Product Development",
  };

  // Mock data for pending requests
  const allRequests = [
    {
      id: "REQ-007",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2026-05-14",
      daysAgo: 0,
      amount: 1200.00,
      category: "medicine",
      description: "Blood pressure and cholesterol medication",
      status: "pending",
      lineManagerApproved: true,
      prescription: { name: "prescription-007.pdf" },
      medicines: [
        { name: "Amlodipine 5mg", quantity: "30", unitPrice: "25.00", subtotal: 750.00 },
        { name: "Atorvastatin 20mg", quantity: "30", unitPrice: "15.00", subtotal: 450.00 }
      ],
      receipts: [{ fileName: "receipt-004.pdf", invoiceNumber: "INV-2024-001234" }],
      notes: "Regular monthly medication refill"
    },
    {
      id: "REQ-008",
      employeeName: "Jose Rizal",
      employeeId: "EMP-2024-001",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2026-05-16",
      daysAgo: 1,
      amount: 850.00,
      category: "medicine",
      description: "Antibiotic course and vitamins",
      status: "pending",
      lineManagerApproved: false,
      prescription: { name: "prescription-008.pdf" },
      medicines: [
        { name: "Amoxicillin 500mg", quantity: "21", unitPrice: "30.00", subtotal: 630.00 },
        { name: "Ascorbic Acid 500mg", quantity: "30", unitPrice: "7.33", subtotal: 220.00 }
      ],
      receipts: [{ fileName: "receipt-008.pdf", invoiceNumber: "INV-2024-002345" }],
      notes: "Prescribed after recent flu"
    },
    {
      id: "REQ-009",
      employeeName: "Liza Soberano",
      employeeId: "EMP-2024-006",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2026-05-12",
      daysAgo: 3,
      amount: 2500.00,
      category: "medicine",
      description: "Diabetes medication and supplies",
      status: "pending",
      lineManagerApproved: false,
      prescription: { name: "prescription-009.pdf" },
      medicines: [
        { name: "Lantus Insulin 100 units/ml", quantity: "10", unitPrice: "200.00", subtotal: 2000.00 },
        { name: "Accu-Chek Test Strips", quantity: "100", unitPrice: "5.00", subtotal: 500.00 }
      ],
      receipts: [{ fileName: "receipt-009.pdf", invoiceNumber: "INV-2024-003456" }],
      notes: "Monthly diabetes care supplies"
    },
    {
      id: "REQ-010",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2024-01-12",
      daysAgo: 6,
      amount: 450.00,
      category: "medicine",
      description: "Pain relief medication",
      status: "approved",
      lineManagerApproved: true,
      prescription: { name: "prescription-010.pdf" },
      medicines: [
        { name: "Paracetamol 500mg", quantity: "30", unitPrice: "15.00", subtotal: 450.00 }
      ],
      receipts: [{ fileName: "receipt-010.pdf", invoiceNumber: "INV-2024-004567" }],
      notes: "",
      hrFullName: "Patricia Gonzales",
      approvalTimestamp: "2024-01-13 1:30 PM"
    },
    {
      id: "REQ-011",
      employeeName: "Jose Rizal",
      employeeId: "EMP-2024-001",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2024-01-10",
      daysAgo: 8,
      amount: 320.00,
      category: "medicine",
      description: "Allergy medication",
      status: "declined",
      lineManagerApproved: true,
      prescription: { name: "prescription-011.pdf" },
      medicines: [
        { name: "Cetirizine 10mg", quantity: "20", unitPrice: "16.00", subtotal: 320.00 }
      ],
      receipts: [{ fileName: "receipt-011.pdf", invoiceNumber: "INV-2024-005678" }],
      notes: "",
      hrFullName: "Patricia Gonzales",
      denialReason: "Prescription date exceeds allowed timeframe",
      denialTimestamp: "2024-01-11 4:20 PM"
    },
    {
      id: "REQ-012",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2026-05-20",
      daysAgo: 0,
      amount: 2800.00,
      category: "optical",
      description: "Prescription eyeglasses",
      status: "pending",
      lineManagerApproved: false,
      prescription: { name: "prescription-012.pdf" },
      medicines: [
        { name: "Prescription Eyeglasses", quantity: "1", unitPrice: "2800.00", subtotal: 2800.00 }
      ],
      receipts: [{ fileName: "receipt-012.pdf", invoiceNumber: "INV-2024-006789" }],
      notes: "Annual eye care benefit"
    },
    {
      id: "REQ-013",
      employeeName: "Liza Soberano",
      employeeId: "EMP-2024-006",
      profilePicture: null,
      department: "Product Development",
      requestDate: "2026-05-08",
      daysAgo: 2,
      amount: 1500.00,
      category: "optical",
      description: "Contact lenses",
      status: "pending",
      lineManagerApproved: false,
      prescription: { name: "prescription-013.pdf" },
      medicines: [
        { name: "Monthly Contact Lenses", quantity: "6", unitPrice: "250.00", subtotal: 1500.00 }
      ],
      receipts: [{ fileName: "receipt-013.pdf", invoiceNumber: "INV-2024-007890" }],
      notes: "6-month supply"
    }
  ];

  // Monthly trend data for last 6 months
  const monthlyTrendData = [
    { month: "Aug", approved: 8 },
    { month: "Sep", approved: 12 },
    { month: "Oct", approved: 10 },
    { month: "Nov", approved: 15 },
    { month: "Dec", approved: 11 },
    { month: "Jan", approved: 14 }
  ];

  const filteredRequests = allRequests
    .filter(req => {
      const statusMatch = filterStatus === "all" || req.status === filterStatus;
      const typeMatch = filterType === "all" || req.category === filterType;
      const yearMatch = filterYear === "all" || new Date(req.requestDate).getFullYear().toString() === filterYear;
      return statusMatch && typeMatch && yearMatch;
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
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });

  const hasActiveFilters = filterStatus !== "all" || filterType !== "all" || filterYear !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterType("all");
    setFilterYear("all");
  };

  const pendingRequests = allRequests.filter(r => r.status === "pending");

  const handleApprove = (request: any) => {
    console.log("Approving request:", request.id);
    // In real app, this would call API
    setIsDetailsOpen(false);
  };

  const handleDecline = () => {
    if (!selectedRequest) return;
    const finalReason = denialReason === "others" ? customDenialReason : getDenialReasonText(denialReason);
    console.log("Declining request:", selectedRequest.id, "with reason:", finalReason);
    // In real app, this would call API
    setIsDeclineOpen(false);
    setIsDetailsOpen(false);
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

    if (status === 'declined') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Denied
      </Badge>;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary/10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2 rounded-lg">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">MedReimburse</h1>
                <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Line Manager Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(manager.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium">{manager.name}</p>
                  <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>{manager.designation}</p>
                </div>
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
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - Left (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Requests Section Title and Filters */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Reimbursement Requests</h2>
                <p style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Review and manage team submissions</p>
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
                    <SelectItem value="declined">Declined</SelectItem>
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
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Badge variant="outline" className="border-primary text-primary">
                  {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                </Badge>
                <span className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                  {filterType !== "all" && `Type: ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`}
                  {filterType !== "all" && (filterStatus !== "all" || filterYear !== "all") && " • "}
                  {filterStatus !== "all" && `Status: ${filterStatus}`}
                  {filterStatus !== "all" && filterYear !== "all" && " • "}
                  {filterYear !== "all" && `Year: ${filterYear}`}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <Card className="border-2 border-dashed border-primary/20">
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
                <Card key={request.id} className={`border-2 border-primary/10 border-l-4 ${request.category === 'medicine' ? 'border-l-purple-600' : 'border-l-blue-500'}`}>
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
                        <p className="font-semibold text-lg">₱{request.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Submitted</label>
                        <p>{request.requestDate}</p>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="bg-muted/20 p-3 rounded-md mb-4">
                        <label className="text-sm font-medium" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Notes</label>
                        <p className="text-sm">{request.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailsOpen(true);
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
                              setIsDeclineOpen(true);
                            }}
                            style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny Request
                          </Button>

                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Request
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Notifications */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-yellow-600" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Pending Approvals</p>
                      <p className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>{pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} awaiting review</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Insights */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Team Insights
                </CardTitle>
                <CardDescription>Approved requests trend (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid key="grid-trend" strokeDasharray="3 3" stroke="#B4D3E2" opacity={0.3} />
                      <XAxis
                        key="xaxis-trend"
                        dataKey="month"
                        tick={{ fill: '#0B8BCB', fontSize: 10 }}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        key="yaxis-trend"
                        tick={{ fill: '#0B8BCB', fontSize: 10 }}
                      />
                      <RechartsTooltip
                        key="tooltip-trend"
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #B4D3E2',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`${value} requests`]}
                      />
                      <Line
                        key="line-approved"
                        type="monotone"
                        dataKey="approved"
                        stroke="#0B8BCB"
                        strokeWidth={2}
                        dot={{ fill: '#0B8BCB', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <Card>
              <CardHeader>
                <CardTitle>Line Manager Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Full Name</Label>
                    <p className="font-medium">{manager.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Employee ID</Label>
                    <p className="font-medium">{manager.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Designation</Label>
                    <p className="font-medium">{manager.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Department</Label>
                    <p className="font-medium">{manager.department}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.64)' }}>Email Address</Label>
                    <p className="font-medium">{manager.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
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
                      <p className="font-medium">{selectedRequest.requestDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval/Denial Information */}
              {(selectedRequest.status === 'approved' || selectedRequest.status === 'declined') && (
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
                      {selectedRequest.status === 'declined' && selectedRequest.denialReason && (
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
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
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
                        <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
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
                <Card className="border-2 border-secondary/20 bg-secondary/5">
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
                    <span className="text-2xl font-bold text-secondary">₱{selectedRequest.amount.toFixed(2)}</span>
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
                        setIsDetailsOpen(false);
                        setIsDeclineOpen(true);
                      }}
                      style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Deny Request
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedRequest)}
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
                        <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
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
                        <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
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

      {/* Decline Modal */}
      <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
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
              <Button variant="secondary" onClick={() => setIsDeclineOpen(false)} style={{ borderColor: 'rgba(0, 0, 0, 0.4)', borderWidth: '1.5px', color: 'rgba(0, 0, 0, 0.8)' }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={denialReason === "others" && !customDenialReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deny Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
