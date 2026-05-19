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
  Download
} from "lucide-react";

interface LineManagerDashboardProps {
  onLogout: () => void;
}

export function LineManagerDashboard({ onLogout }: LineManagerDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterAmount, setFilterAmount] = useState("all");

  const manager = {
    name: "Roberto Cruz",
    designation: "Engineering Manager",
    department: "Product Development",
  };

  // Mock data for pending requests
  const allRequests = [
    {
      id: "REQ-007",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      department: "Product Development",
      requestDate: "2024-01-18",
      daysAgo: 0,
      amount: 1200.00,
      category: "Medicines",
      description: "Blood pressure and cholesterol medication",
      status: "pending",
      medicines: [
        { name: "Blood Pressure Medication", quantity: "30", unitPrice: "25.00", subtotal: 750.00 },
        { name: "Cholesterol Medication", quantity: "30", unitPrice: "15.00", subtotal: 450.00 }
      ],
      receipts: [{ fileName: "receipt-004.pdf", invoiceNumber: "INV-2024-001234" }],
      notes: "Regular monthly medication refill"
    },
    {
      id: "REQ-008",
      employeeName: "Jose Rizal",
      employeeId: "EMP-2024-001",
      department: "Product Development",
      requestDate: "2024-01-17",
      daysAgo: 1,
      amount: 850.00,
      category: "Medicines",
      description: "Antibiotic course and vitamins",
      status: "pending",
      medicines: [
        { name: "Antibiotic Course", quantity: "21", unitPrice: "30.00", subtotal: 630.00 },
        { name: "Vitamin C", quantity: "30", unitPrice: "7.33", subtotal: 220.00 }
      ],
      receipts: [{ fileName: "receipt-008.pdf", invoiceNumber: "INV-2024-002345" }],
      notes: "Prescribed after recent flu"
    },
    {
      id: "REQ-009",
      employeeName: "Liza Soberano",
      employeeId: "EMP-2024-006",
      department: "Product Development",
      requestDate: "2024-01-15",
      daysAgo: 3,
      amount: 2500.00,
      category: "Medicines",
      description: "Diabetes medication and supplies",
      status: "pending",
      medicines: [
        { name: "Insulin", quantity: "10", unitPrice: "200.00", subtotal: 2000.00 },
        { name: "Test Strips", quantity: "100", unitPrice: "5.00", subtotal: 500.00 }
      ],
      receipts: [{ fileName: "receipt-009.pdf", invoiceNumber: "INV-2024-003456" }],
      notes: "Monthly diabetes care supplies"
    },
    {
      id: "REQ-010",
      employeeName: "Maria Santos",
      employeeId: "EMP-2024-002",
      department: "Product Development",
      requestDate: "2024-01-12",
      daysAgo: 6,
      amount: 450.00,
      category: "Medicines",
      description: "Pain relief medication",
      status: "approved",
      medicines: [
        { name: "Paracetamol 500mg", quantity: "30", unitPrice: "15.00", subtotal: 450.00 }
      ],
      receipts: [{ fileName: "receipt-010.pdf", invoiceNumber: "INV-2024-004567" }],
      notes: "",
      approvedDate: "2024-01-13"
    },
    {
      id: "REQ-011",
      employeeName: "Jose Rizal",
      employeeId: "EMP-2024-001",
      department: "Product Development",
      requestDate: "2024-01-10",
      daysAgo: 8,
      amount: 320.00,
      category: "Medicines",
      description: "Allergy medication",
      status: "declined",
      medicines: [
        { name: "Antihistamine", quantity: "20", unitPrice: "16.00", subtotal: 320.00 }
      ],
      receipts: [{ fileName: "receipt-011.pdf", invoiceNumber: "INV-2024-005678" }],
      notes: "",
      declineReason: "Prescription date exceeds allowed timeframe",
      declinedDate: "2024-01-11"
    }
  ];

  // Recent activity
  const recentActivity = [
    {
      id: "REQ-010",
      action: "approved",
      employeeName: "Maria Santos",
      amount: 450.00,
      timestamp: "2 hours ago"
    },
    {
      id: "REQ-011",
      action: "declined",
      employeeName: "Jose Rizal",
      amount: 320.00,
      reason: "Prescription date exceeds allowed timeframe",
      timestamp: "Yesterday"
    },
    {
      id: "REQ-012",
      action: "approved",
      employeeName: "Liza Soberano",
      amount: 680.00,
      timestamp: "2 days ago"
    }
  ];

  const filteredRequests = allRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesAmount = filterAmount === "all" ||
                         (filterAmount === "low" && req.amount < 500) ||
                         (filterAmount === "medium" && req.amount >= 500 && req.amount < 1500) ||
                         (filterAmount === "high" && req.amount >= 1500);
    return matchesSearch && matchesStatus && matchesAmount;
  });

  const pendingRequests = filteredRequests.filter(r => r.status === "pending");
  const approvedToday = filteredRequests.filter(r => r.status === "approved").length;
  const declinedCount = filteredRequests.filter(r => r.status === "declined").length;
  const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

  const handleApprove = (request: any) => {
    console.log("Approving request:", request.id);
    // In real app, this would call API
    setIsDetailsOpen(false);
  };

  const handleDecline = () => {
    if (!declineReason.trim()) return;
    console.log("Declining request:", selectedRequest?.id, "Reason:", declineReason);
    // In real app, this would call API
    setIsDeclineOpen(false);
    setIsDetailsOpen(false);
    setDeclineReason("");
  };

  const openDeclineModal = (request: any) => {
    setSelectedRequest(request);
    setIsDeclineOpen(true);
  };

  const getUrgencyBadge = (daysAgo: number) => {
    if (daysAgo >= 2) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Urgent</Badge>;
    } else if (daysAgo >= 1) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">1 day</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">New</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
                <p className="text-sm text-muted-foreground">Line Manager Portal</p>
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
                  <p className="text-sm text-muted-foreground">{manager.designation}</p>
                </div>
              </div>
              <Button onClick={onLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - Left (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Approvals</p>
                      <div className="text-3xl font-bold text-yellow-600 mt-1">{pendingRequests.length}</div>
                    </div>
                    <Clock className="h-10 w-10 text-yellow-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Today</p>
                      <div className="text-3xl font-bold text-green-600 mt-1">{approvedToday}</div>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Declined</p>
                      <div className="text-3xl font-bold text-red-600 mt-1">{declinedCount}</div>
                    </div>
                    <XCircle className="h-10 w-10 text-red-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Amount</p>
                      <div className="text-2xl font-bold text-primary mt-1">₱{totalPendingAmount.toLocaleString()}</div>
                    </div>
                    <DollarSign className="h-10 w-10 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee name or request ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterAmount} onValueChange={setFilterAmount}>
                    <SelectTrigger className="w-full sm:w-40 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amounts</SelectItem>
                      <SelectItem value="low">&lt; ₱500</SelectItem>
                      <SelectItem value="medium">₱500 - ₱1,500</SelectItem>
                      <SelectItem value="high">&gt; ₱1,500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Requests</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {pendingRequests.length} requests
                  </Badge>
                </CardTitle>
                <CardDescription>Review and approve team reimbursement requests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending requests at the moment.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="mt-1">
                              <AvatarFallback className="bg-secondary text-white">
                                {getInitials(request.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{request.employeeName}</h4>
                                {request.status === "pending" && getUrgencyBadge(request.daysAgo)}
                                {request.status === "approved" && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                    Approved
                                  </Badge>
                                )}
                                {request.status === "declined" && (
                                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                    Declined
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{request.department} • {request.id}</p>
                              <p className="text-sm mt-2">{request.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {request.requestDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Receipt className="h-3 w-3" />
                                  {request.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary">₱{request.amount.toFixed(2)}</div>
                              {request.status === "pending" && (
                                <p className="text-xs text-muted-foreground">{request.daysAgo === 0 ? 'Today' : `${request.daysAgo} day${request.daysAgo > 1 ? 's' : ''} ago`}</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(request)}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={() => openDeclineModal(request)}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Overdue Request</p>
                      <p className="text-xs text-muted-foreground">1 request pending for 3+ days</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">New Request</p>
                      <p className="text-xs text-muted-foreground">Maria Santos submitted today</p>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">This Month</span>
                    <span className="text-sm font-semibold">{allRequests.length} requests</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(approvedToday / allRequests.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{approvedToday} approved</span>
                    <span>{declinedCount} declined</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">High-Value Claims</p>
                  <div className="space-y-2">
                    {pendingRequests
                      .filter(r => r.amount > 1000)
                      .slice(0, 2)
                      .map(r => (
                        <div key={r.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{r.employeeName}</span>
                          <span className="font-semibold text-primary">₱{r.amount.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Frequent Submitters</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Maria Santos</span>
                      <span className="font-semibold">2 requests</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Jose Rizal</span>
                      <span className="font-semibold">2 requests</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full p-1 ${
                        activity.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {activity.action === 'approved' ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      {index < recentActivity.length - 1 && (
                        <div className="w-px h-full bg-gray-200 flex-1 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium">
                        {activity.action === 'approved' ? 'Approved' : 'Declined'} {activity.id}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.employeeName} • ₱{activity.amount}</p>
                      {activity.reason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {activity.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Request Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details - {selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              Review complete reimbursement information
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-secondary text-white text-xl">
                        {getInitials(selectedRequest.employeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRequest.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedRequest.employeeId}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-sm text-muted-foreground">Request Date</Label>
                      <p className="font-medium">{selectedRequest.requestDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedRequest.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medicines Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medicines Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRequest.medicines.map((medicine: any, index: number) => (
                    <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {medicine.quantity} × ₱{medicine.unitPrice}
                          </p>
                        </div>
                        <p className="font-semibold">₱{medicine.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">₱{selectedRequest.amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Receipts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedRequest.receipts.map((receipt: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">{receipt.fileName}</p>
                            <p className="text-xs text-muted-foreground">Invoice: {receipt.invoiceNumber}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notes */}
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

              {/* Actions */}
              {selectedRequest.status === "pending" && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setIsDeclineOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline Request
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
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Modal */}
      <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="decline-reason">Reason for Decline *</Label>
              <Textarea
                id="decline-reason"
                placeholder="Enter the reason for declining this request..."
                rows={4}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                This action cannot be undone. The employee will be notified of the decline reason.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDeclineOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={!declineReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
