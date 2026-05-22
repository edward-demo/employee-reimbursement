import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  Filter,
  Download,
  FilterX,
  Inbox,
  Pill
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export interface LineManagerProfileData {
  employeeProfileId: string;
  name: string;
  designation: string;
  department: string;
}

interface LineManagerRequestItem {
  name: string;
  quantity: string;
  unitPrice: string;
  subtotal: number;
}

interface LineManagerReceipt {
  fileName: string;
  invoiceNumber: string;
}

interface LineManagerRequest {
  id: string;
  requestId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  requestDate: string;
  daysAgo: number;
  amount: number;
  category: string;
  description: string;
  status: string;
  currentReviewStage: string;
  medicines: LineManagerRequestItem[];
  receipts: LineManagerReceipt[];
  notes: string;
}

interface LineManagerDashboardProps {
  onLogout: () => void;
  profileData: LineManagerProfileData;
}

export function LineManagerDashboard({ onLogout, profileData }: LineManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterAmount, setFilterAmount] = useState("all");
  const [teamRequests, setTeamRequests] = useState<LineManagerRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const manager = profileData;

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

  useEffect(() => {
    const loadPendingTeamRequests = async () => {
      if (!supabase) {
        setRequestsError("Supabase is not configured.");
        setTeamRequests([]);
        return;
      }

      setIsRequestsLoading(true);
      setRequestsError("");

      try {
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from("employee_profiles")
          .select(`
            employee_profile_id,
            employee_number,
            full_name,
            departments(name)
          `)
          .eq("line_manager_employee_profile_id", profileData.employeeProfileId)
          .eq("employment_status", "active");

        if (teamMembersError) {
          throw new Error(teamMembersError.message);
        }

        const teamMemberRows = teamMembers ?? [];
        const teamMemberIds = teamMemberRows.map((employee: any) => employee.employee_profile_id);

        if (teamMemberIds.length === 0) {
          setTeamRequests([]);
          return;
        }

        const { data: requests, error: requestsError } = await supabase
          .from("reimbursement_requests")
          .select(`
            reimbursement_request_id,
            request_number,
            employee_profile_id,
            category,
            status,
            current_review_stage,
            submitted_at,
            claim_amount,
            notes
          `)
          .in("employee_profile_id", teamMemberIds)
          .eq("status", "pending")
          .eq("current_review_stage", "line_manager_review")
          .order("submitted_at", { ascending: false });

        if (requestsError) {
          throw new Error(requestsError.message);
        }

        const requestRows = requests ?? [];
        const requestIds = requestRows.map((request: any) => request.reimbursement_request_id);

        const { data: items, error: itemsError } = requestIds.length > 0
          ? await supabase
            .from("reimbursement_request_items")
            .select("reimbursement_request_id, item_name, quantity, unit_price, subtotal_amount, sequence_number")
            .in("reimbursement_request_id", requestIds)
            .order("sequence_number", { ascending: true })
          : { data: [], error: null };

        if (itemsError) {
          throw new Error(itemsError.message);
        }

        const { data: receipts, error: receiptsError } = requestIds.length > 0
          ? await supabase
            .from("reimbursement_receipts")
            .select(`
              reimbursement_request_id,
              invoice_number,
              sequence_number,
              reimbursement_documents(file_name)
            `)
            .in("reimbursement_request_id", requestIds)
            .order("sequence_number", { ascending: true })
          : { data: [], error: null };

        if (receiptsError) {
          throw new Error(receiptsError.message);
        }

        const employeeById = new Map(
          teamMemberRows.map((employee: any) => {
            const department = Array.isArray(employee.departments)
              ? employee.departments[0]
              : employee.departments;

            return [
              employee.employee_profile_id,
              {
                employeeName: employee.full_name,
                employeeId: employee.employee_number,
                department: department?.name ?? "Unassigned"
              }
            ];
          })
        );

        const itemsByRequestId = new Map<string, LineManagerRequestItem[]>();
        (items ?? []).forEach((item: any) => {
          const requestItems = itemsByRequestId.get(item.reimbursement_request_id) ?? [];
          requestItems.push({
            name: item.item_name,
            quantity: Number(item.quantity ?? 0).toLocaleString(),
            unitPrice: Number(item.unit_price ?? 0).toFixed(2),
            subtotal: Number(item.subtotal_amount ?? 0)
          });
          itemsByRequestId.set(item.reimbursement_request_id, requestItems);
        });

        const receiptsByRequestId = new Map<string, LineManagerReceipt[]>();
        (receipts ?? []).forEach((receipt: any) => {
          const requestReceipts = receiptsByRequestId.get(receipt.reimbursement_request_id) ?? [];
          const document = Array.isArray(receipt.reimbursement_documents)
            ? receipt.reimbursement_documents[0]
            : receipt.reimbursement_documents;
          requestReceipts.push({
            fileName: document?.file_name ?? "Receipt file",
            invoiceNumber: receipt.invoice_number
          });
          receiptsByRequestId.set(receipt.reimbursement_request_id, requestReceipts);
        });

        const loadedRequests = requestRows.map((request: any) => {
          const employee = employeeById.get(request.employee_profile_id) ?? {
            employeeName: "Unknown Employee",
            employeeId: "Unassigned",
            department: "Unassigned"
          };
          const requestItems = itemsByRequestId.get(request.reimbursement_request_id) ?? [];
          const submittedAt = request.submitted_at ? new Date(request.submitted_at) : null;
          const daysAgo = submittedAt
            ? Math.max(0, Math.floor((Date.now() - submittedAt.getTime()) / 86400000))
            : 0;

          return {
            id: request.request_number,
            requestId: request.reimbursement_request_id,
            ...employee,
            requestDate: submittedAt ? submittedAt.toLocaleDateString() : "",
            daysAgo,
            amount: Number(request.claim_amount ?? 0),
            category: formatCategory(request.category),
            description: requestItems.map((item) => item.name).join(", "),
            status: request.status,
            currentReviewStage: request.current_review_stage,
            medicines: requestItems,
            receipts: receiptsByRequestId.get(request.reimbursement_request_id) ?? [],
            notes: request.notes ?? ""
          };
        });

        setTeamRequests(loadedRequests);
      } catch (error) {
        console.error("Team reimbursement requests could not be loaded.", error);
        setTeamRequests([]);
        setRequestsError("We couldn't load team requests right now. Please refresh the page or try again shortly.");
      } finally {
        setIsRequestsLoading(false);
      }
    };

    void loadPendingTeamRequests();
  }, [profileData.employeeProfileId]);

  const formatCategory = (category: string) => {
    if (!category) return "Uncategorized";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const filteredRequests = teamRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesAmount = filterAmount === "all" ||
                         (filterAmount === "low" && req.amount < 500) ||
                         (filterAmount === "medium" && req.amount >= 500 && req.amount < 1500) ||
                         (filterAmount === "high" && req.amount >= 1500);
    return matchesSearch && matchesStatus && matchesAmount;
  });

  const actionablePendingRequests = teamRequests.filter(
    r => r.status === "pending" && r.currentReviewStage === "line_manager_review"
  );
  const pendingRequests = filteredRequests.filter(
    r => r.status === "pending" && r.currentReviewStage === "line_manager_review"
  );
  const approvedToday = 0;
  const declinedCount = 0;
  const hasActiveFilters = searchQuery !== "" || filterStatus !== "pending" || filterAmount !== "all";
  const isLineManagerSignedOff = (request: any) =>
    request.status === "pending" && request.currentReviewStage === "hr_admin_review";
  const canShowLineManagerActions = (request: any) =>
    request.status === "pending" && !isLineManagerSignedOff(request);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("pending");
    setFilterAmount("all");
  };

  const handleApprove = (request: any) => {
    console.log("Signing off request for HR review:", request.id);
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMedicinesSubtotal = (medicines: any[]) => {
    return medicines.reduce((total, medicine) => total + medicine.subtotal, 0);
  };

  const getTypeBadge = (category: string) => (
    <Badge className="bg-purple-100 text-purple-600 border-purple-200">{category}</Badge>
  );

  const getStatusBadge = (request: any) => {
    if (request.status === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }

    if (isLineManagerSignedOff(request)) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Signed Off
        </Badge>
      );
    }

    if (request.status === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }

    if (request.status === "declined") {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Declined
        </Badge>
      );
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-primary">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Reimbursement Requests</h2>
                      <p className="text-muted-foreground">Review and manage team submissions</p>
                    </div>
                    <Badge className="w-fit bg-yellow-100 text-yellow-800 border-yellow-200">
                      {actionablePendingRequests.length} pending
                    </Badge>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by employee name or request ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-36 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="declined">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterAmount} onValueChange={setFilterAmount}>
                        <SelectTrigger className="w-40 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Amounts</SelectItem>
                          <SelectItem value="low">&lt; ₱500</SelectItem>
                          <SelectItem value="medium">₱500 - ₱1,500</SelectItem>
                          <SelectItem value="high">&gt; ₱1,500</SelectItem>
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
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Badge variant="outline" className="border-primary text-primary">
                      {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {searchQuery && `Search: ${searchQuery}`}
                      {searchQuery && (filterStatus !== "pending" || filterAmount !== "all") && " • "}
                      {filterStatus !== "pending" && `Status: ${filterStatus}`}
                      {filterStatus !== "pending" && filterAmount !== "all" && " • "}
                      {filterAmount !== "all" && `Amount: ${filterAmount}`}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {isRequestsLoading ? (
                    <Card className="border-2 border-primary/10">
                      <CardContent className="p-12 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
                        <h3 className="text-lg font-semibold mb-2">Loading requests</h3>
                        <p className="text-muted-foreground">
                          Fetching pending team submissions from Supabase.
                        </p>
                      </CardContent>
                    </Card>
                  ) : requestsError ? (
                    <Card className="border border-muted bg-muted/20 shadow-none">
                      <CardContent className="px-6 py-6 text-center sm:px-8">
                        <p className="text-sm text-muted-foreground">{requestsError}</p>
                      </CardContent>
                    </Card>
                  ) : pendingRequests.length === 0 ? (
                    <Card className="border-2 border-muted bg-muted/20 shadow-none">
                      <CardContent className="px-6 py-12 text-center sm:p-14">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-muted bg-white">
                          <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">You're all caught up</h3>
                        <p className="mx-auto max-w-md text-muted-foreground">
                          There are no team reimbursement requests awaiting your review right now.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingRequests.map((request) => (
                      <Card key={request.id} className="border-2 border-primary/10">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-100">
                                <Pill className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold">{request.employeeName}</h3>
                                  {getTypeBadge(request.category)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {request.employeeId} • {request.department}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(request)}
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
                              <p className="font-semibold text-lg">₱{request.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                              <p>{request.requestDate}</p>
                            </div>
                          </div>

                          {request.notes && (
                            <div className="bg-muted/20 p-3 rounded-md mb-4">
                              <label className="text-sm font-medium text-muted-foreground">Notes</label>
                              <p className="text-sm">{request.notes}</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Details
                            </Button>

                            {canShowLineManagerActions(request) && (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openDeclineModal(request)}
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
                                  Sign Off for HR/Admin Review
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
                    <span className="text-sm font-semibold">{teamRequests.length} requests</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${teamRequests.length > 0 ? (approvedToday / teamRequests.length) * 100 : 0}%` }}
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
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <Card>
              <CardHeader>
                <CardTitle>Line Manager Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{manager.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Designation</Label>
                    <p className="font-medium">{manager.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Department</Label>
                    <p className="font-medium">{manager.department}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-full sm:min-w-[860px] sm:max-w-[860px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reimbursement Request Details</DialogTitle>
            <DialogDescription>
              Complete information for request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <p className="font-medium">{selectedRequest.requestDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedRequest.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRequest.receipts.map((receipt: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Receipt {index + 1}: {receipt.fileName}</span>
                        </div>
                      </div>
                      <div className="ml-6 text-xs text-muted-foreground">
                        Invoice: {receipt.invoiceNumber}
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medicines Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRequest.medicines.map((medicine: any, index: number) => (
                      <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <Pill className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{medicine.name}</span>
                          </div>
                          <span className="font-semibold">₱{medicine.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="ml-6 text-sm text-muted-foreground">
                          Quantity {medicine.quantity} × ₱{medicine.unitPrice}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-secondary">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Medicines Subtotal:</span>
                    <span className="font-medium">₱{getMedicinesSubtotal(selectedRequest.medicines).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-medium">Total Reimbursement:</span>
                    <span className="text-2xl font-bold text-secondary">₱{selectedRequest.amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {(selectedRequest.status === "approved" || selectedRequest.status === "declined") && (
                <Card className={selectedRequest.status === "approved" ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedRequest.status === "approved" ? "Approval Information" : "Decline Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          {selectedRequest.status === "approved" ? "Approved Date" : "Declined Date"}
                        </Label>
                        <p className="font-medium">
                          {selectedRequest.status === "approved" ? selectedRequest.approvedDate : selectedRequest.declinedDate}
                        </p>
                      </div>
                      {selectedRequest.status === "declined" && selectedRequest.declineReason && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Decline Reason</Label>
                          <p className="font-medium text-red-700">{selectedRequest.declineReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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

              {canShowLineManagerActions(selectedRequest) && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setIsDeclineOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Request
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedRequest)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sign Off for HR/Admin Review
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
            <DialogTitle>Deny Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="decline-reason">Reason for Denial *</Label>
              <Textarea
                id="decline-reason"
                placeholder="Enter the reason for denying this request..."
                rows={4}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                This action cannot be undone. The employee will be notified of the denial reason.
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
                Deny Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
