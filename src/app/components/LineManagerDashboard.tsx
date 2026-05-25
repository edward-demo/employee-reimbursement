import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
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
  id: string;
  fileName: string;
  invoiceNumber: string;
  mimeType: string | null;
  storageBucket: string;
  storagePath: string | null;
}

interface LineManagerDocument {
  id: string;
  type: "receipt" | "prescription";
  fileName: string;
  invoiceNumber?: string;
  mimeType: string | null;
  storageBucket: string;
  storagePath: string | null;
}

interface PreviewDocumentState extends LineManagerDocument {
  label: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LineManagerRequest {
  id: string;
  requestId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  requestDate: string;
  submittedAt: string | null;
  amount: number;
  category: string;
  description: string;
  status: string;
  currentReviewStage: string;
  medicines: LineManagerRequestItem[];
  receipts: LineManagerReceipt[];
  uploadedDocuments: LineManagerDocument[];
  notes: string;
}

interface LineManagerActivityRequest {
  id: string;
  requestId: string;
  employeeName: string;
  amount: number;
  category: string;
  status: string;
  currentReviewStage: string;
  activityAt: string | null;
}

interface LineManagerDashboardProps {
  onLogout: () => void;
  profileData: LineManagerProfileData;
}

const teamRequestsErrorMessage = "Unable to retrieve data. Please refresh the page.";
const isLineManagerRealtimeDebugEnabled = import.meta.env.DEV;
const signedDocumentUrlExpirySeconds = 60 * 5;

const formatCategory = (category: string) => {
  if (!category) return "Uncategorized";
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const formatSubmittedDate = (dateValue: string | null) => (
  dateValue ? new Date(dateValue).toISOString().slice(0, 10) : ""
);

const getDocumentExtension = (fileName: string) => (
  fileName.split(".").pop()?.toLowerCase() ?? ""
);

const getDocumentPreviewKind = (uploadedDocument: Pick<LineManagerDocument, "fileName" | "mimeType">) => {
  const mimeType = uploadedDocument.mimeType?.toLowerCase() ?? "";
  const extension = getDocumentExtension(uploadedDocument.fileName);

  if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return "image";
  }

  if (mimeType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  return "unsupported";
};

const lineManagerReviewStages = ["line_manager_review"];
const hrAdminReviewStages = ["hr_admin_review"];
const lineManagerDashboardReviewStages = [...lineManagerReviewStages, ...hrAdminReviewStages];
const getHrAdminReviewStage = () => "hr_admin_review";
const isLineManagerReviewStage = (currentReviewStage: string) => (
  lineManagerReviewStages.includes(currentReviewStage)
);
const isHrAdminReviewStage = (currentReviewStage: string) => (
  hrAdminReviewStages.includes(currentReviewStage)
);
const isLineManagerDashboardReviewStage = (currentReviewStage: string) => (
  lineManagerDashboardReviewStages.includes(currentReviewStage)
);
const logLineManagerSignOffError = (
  operation: string,
  requestId: string,
  error: { message?: string; code?: string; details?: string; hint?: string } | null | undefined
) => {
  if (!isLineManagerRealtimeDebugEnabled || !error) {
    return;
  }

  console.error(`[LineManagerDashboard sign-off] ${operation} failed`, {
    requestId,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
};

const logLineManagerSignOffDebug = (
  operation: string,
  requestId: string,
  details: Record<string, unknown>
) => {
  if (!isLineManagerRealtimeDebugEnabled) {
    return;
  }

  console.log(`[LineManagerDashboard sign-off] ${operation}`, {
    requestId,
    ...details
  });
};

export function LineManagerDashboard({ onLogout, profileData }: LineManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<PreviewDocumentState | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [teamRequests, setTeamRequests] = useState<LineManagerRequest[]>([]);
  const [teamActivityRequests, setTeamActivityRequests] = useState<LineManagerActivityRequest[]>([]);
  const [activeTeamMemberCount, setActiveTeamMemberCount] = useState(0);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState("");
  const [signOffError, setSignOffError] = useState("");
  const activeTeamMemberIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedTeamScopeRef = useRef(false);
  const isRefreshInFlightRef = useRef(false);
  const hasQueuedRefreshRef = useRef(false);

  const manager = profileData;

  const logRealtimeDebug = useCallback((message: string, details?: Record<string, unknown>) => {
    if (!isLineManagerRealtimeDebugEnabled) {
      return;
    }

    console.log(`[LineManagerDashboard realtime] ${message}`, details ?? {});
  }, []);

  const logDashboardQueryDebug = useCallback((
    queryName: string,
    details: {
      params?: Record<string, unknown>;
      error?: { message?: string; code?: string; details?: string; hint?: string } | null;
      rowCount?: number;
      sharedSections?: string[];
    }
  ) => {
    if (!isLineManagerRealtimeDebugEnabled) {
      return;
    }

    console.log(`[LineManagerDashboard query] ${queryName}`, {
      params: details.params ?? {},
      rowCount: details.rowCount ?? null,
      sharedSections: details.sharedSections ?? ["Requests Queue", "Alerts", "Team Insights"],
      error: details.error
        ? {
          message: details.error.message,
          code: details.error.code,
          details: details.error.details,
          hint: details.error.hint
        }
        : null
    });
  }, []);

  const loadPendingTeamRequests = useCallback(async ({ showLoading = false } = {}) => {
    if (!supabase) {
      setRequestsError("Supabase is not configured.");
      setTeamRequests([]);
      setTeamActivityRequests([]);
      setActiveTeamMemberCount(0);
      activeTeamMemberIdsRef.current = new Set();
      hasLoadedTeamScopeRef.current = true;
      return;
    }

    if (showLoading) {
      setIsRequestsLoading(true);
    }
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

      logDashboardQueryDebug("direct_reports", {
        params: {
          lineManagerEmployeeProfileId: profileData.employeeProfileId,
          employmentStatus: "active"
        },
        rowCount: teamMembers?.length ?? 0,
        error: teamMembersError
      });

      if (teamMembersError) {
        throw new Error(teamMembersError.message);
      }

      const teamMemberRows = teamMembers ?? [];
      const teamMemberIds = teamMemberRows.map((employee: any) => employee.employee_profile_id);
      activeTeamMemberIdsRef.current = new Set(teamMemberIds);
      hasLoadedTeamScopeRef.current = true;
      setActiveTeamMemberCount(teamMemberRows.length);

      if (teamMemberIds.length === 0) {
        setTeamRequests([]);
        setTeamActivityRequests([]);
        return;
      }

      const { data: requests, error: requestsError } = await supabase
        .from("reimbursement_requests")
        .select(`
            reimbursement_request_id,
            request_number,
            request_reference_number,
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
        .in("current_review_stage", lineManagerDashboardReviewStages)
        .order("submitted_at", { ascending: false });

      logDashboardQueryDebug("pending_team_requests", {
        params: {
          directReportCount: teamMemberIds.length,
          status: "pending",
          currentReviewStage: lineManagerDashboardReviewStages
        },
        rowCount: requests?.length ?? 0,
        error: requestsError
      });

      if (requestsError) {
        throw new Error(requestsError.message);
      }

      const { data: activityRequests, error: activityRequestsError } = await supabase
        .from("reimbursement_requests")
        .select(`
            reimbursement_request_id,
            request_number,
            request_reference_number,
            employee_profile_id,
            category,
            status,
            current_review_stage,
            submitted_at,
            updated_at,
            claim_amount
          `)
        .in("employee_profile_id", teamMemberIds)
        .order("updated_at", { ascending: false });

      logDashboardQueryDebug("team_activity_requests", {
        params: {
          directReportCount: teamMemberIds.length,
          orderBy: "updated_at desc"
        },
        rowCount: activityRequests?.length ?? 0,
        error: activityRequestsError
      });

      if (activityRequestsError) {
        throw new Error(activityRequestsError.message);
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

      logDashboardQueryDebug("pending_request_items", {
        params: { requestCount: requestIds.length },
        rowCount: items?.length ?? 0,
        error: itemsError
      });

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      const { data: receipts, error: receiptsError } = requestIds.length > 0
        ? await supabase
          .from("reimbursement_receipts")
          .select(`
              reimbursement_receipt_id,
              reimbursement_request_id,
              invoice_number,
              sequence_number,
              reimbursement_documents(
                reimbursement_document_id,
                file_name,
                mime_type,
                storage_bucket,
                storage_path
              )
            `)
          .in("reimbursement_request_id", requestIds)
          .order("sequence_number", { ascending: true })
        : { data: [], error: null };

      logDashboardQueryDebug("pending_request_receipts", {
        params: { requestCount: requestIds.length },
        rowCount: receipts?.length ?? 0,
        error: receiptsError
      });

      if (receiptsError) {
        throw new Error(receiptsError.message);
      }

      const { data: prescriptions, error: prescriptionsError } = requestIds.length > 0
        ? await supabase
          .from("reimbursement_documents")
          .select(`
              reimbursement_document_id,
              reimbursement_request_id,
              file_name,
              mime_type,
              storage_bucket,
              storage_path,
              uploaded_at
            `)
          .in("reimbursement_request_id", requestIds)
          .eq("document_type", "prescription")
          .order("uploaded_at", { ascending: true })
        : { data: [], error: null };

      logDashboardQueryDebug("pending_request_prescriptions", {
        params: {
          requestCount: requestIds.length,
          documentType: "prescription"
        },
        rowCount: prescriptions?.length ?? 0,
        error: prescriptionsError
      });

      if (prescriptionsError) {
        throw new Error(prescriptionsError.message);
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
          id: document?.reimbursement_document_id ?? receipt.reimbursement_receipt_id,
          fileName: document?.file_name ?? "Receipt file",
          invoiceNumber: receipt.invoice_number,
          mimeType: document?.mime_type ?? null,
          storageBucket: document?.storage_bucket ?? "reimbursement-documents",
          storagePath: document?.storage_path ?? null
        });
        receiptsByRequestId.set(receipt.reimbursement_request_id, requestReceipts);
      });

      const prescriptionsByRequestId = new Map<string, LineManagerDocument[]>();
      (prescriptions ?? []).forEach((prescription: any) => {
        const requestPrescriptions = prescriptionsByRequestId.get(prescription.reimbursement_request_id) ?? [];
        requestPrescriptions.push({
          id: prescription.reimbursement_document_id,
          type: "prescription",
          fileName: prescription.file_name ?? "Prescription file",
          mimeType: prescription.mime_type ?? null,
          storageBucket: prescription.storage_bucket ?? "reimbursement-documents",
          storagePath: prescription.storage_path ?? null
        });
        prescriptionsByRequestId.set(prescription.reimbursement_request_id, requestPrescriptions);
      });

      const loadedRequests = requestRows.map((request: any) => {
        const employee = employeeById.get(request.employee_profile_id) ?? {
          employeeName: "Unknown Employee",
          employeeId: "Unassigned",
          department: "Unassigned"
        };
        const requestItems = itemsByRequestId.get(request.reimbursement_request_id) ?? [];
        const requestReceipts = receiptsByRequestId.get(request.reimbursement_request_id) ?? [];
        const requestUploadedDocuments: LineManagerDocument[] = [
          ...(prescriptionsByRequestId.get(request.reimbursement_request_id) ?? []),
          ...requestReceipts.map((receipt) => ({
            id: receipt.id,
            type: "receipt" as const,
            fileName: receipt.fileName,
            invoiceNumber: receipt.invoiceNumber,
            mimeType: receipt.mimeType,
            storageBucket: receipt.storageBucket,
            storagePath: receipt.storagePath
          }))
        ];
        return {
          id: request.request_reference_number ?? request.request_number,
          requestId: request.reimbursement_request_id,
          ...employee,
          requestDate: formatSubmittedDate(request.submitted_at ?? null),
          submittedAt: request.submitted_at ?? null,
          amount: Number(request.claim_amount ?? 0),
          category: formatCategory(request.category),
          description: requestItems.map((item) => item.name).join(", "),
          status: request.status,
          currentReviewStage: request.current_review_stage,
          medicines: requestItems,
          receipts: requestReceipts,
          uploadedDocuments: requestUploadedDocuments,
          notes: request.notes ?? ""
        };
      });

      setTeamRequests(loadedRequests);
      setTeamActivityRequests((activityRequests ?? []).map((request: any) => {
        const employee = employeeById.get(request.employee_profile_id) ?? {
          employeeName: "Unknown Employee"
        };

        return {
          id: request.request_reference_number ?? request.request_number,
          requestId: request.reimbursement_request_id,
          employeeName: employee.employeeName,
          amount: Number(request.claim_amount ?? 0),
          category: formatCategory(request.category),
          status: request.status,
          currentReviewStage: request.current_review_stage,
          activityAt: request.updated_at ?? request.submitted_at ?? null
        };
      }));
    } catch (error) {
      console.error("Team reimbursement requests could not be loaded.", error);
      if (showLoading) {
        setTeamRequests([]);
        setTeamActivityRequests([]);
        setActiveTeamMemberCount(0);
        activeTeamMemberIdsRef.current = new Set();
        hasLoadedTeamScopeRef.current = true;
      }
      setRequestsError(teamRequestsErrorMessage);
    } finally {
      if (showLoading) {
        setIsRequestsLoading(false);
      }
    }
  }, [logDashboardQueryDebug, profileData.employeeProfileId]);

  const refreshPendingTeamRequests = useCallback(async ({ showLoading = false } = {}) => {
    if (isRefreshInFlightRef.current) {
      hasQueuedRefreshRef.current = true;
      return;
    }

    isRefreshInFlightRef.current = true;

    try {
      await loadPendingTeamRequests({ showLoading });
    } finally {
      isRefreshInFlightRef.current = false;

      if (hasQueuedRefreshRef.current) {
        hasQueuedRefreshRef.current = false;
        void refreshPendingTeamRequests();
      }
    }
  }, [loadPendingTeamRequests]);

  useEffect(() => {
    activeTeamMemberIdsRef.current = new Set();
    hasLoadedTeamScopeRef.current = false;
    isRefreshInFlightRef.current = false;
    hasQueuedRefreshRef.current = false;

    if (!profileData.employeeProfileId) {
      logRealtimeDebug("waiting for line manager employee profile id before loading or subscribing");
      return;
    }

    void refreshPendingTeamRequests({ showLoading: true });

    if (!supabase) {
      return;
    }

    const shouldRefreshForEvent = (row: Record<string, unknown> | null | undefined) => {
      const employeeProfileId = typeof row?.employee_profile_id === "string"
        ? row.employee_profile_id
        : null;

      if (!employeeProfileId) {
        return true;
      }

      if (!hasLoadedTeamScopeRef.current) {
        return true;
      }

      return activeTeamMemberIdsRef.current.has(employeeProfileId);
    };

    const getTeamScopeStatus = (row: Record<string, unknown> | null | undefined) => {
      const employeeProfileId = typeof row?.employee_profile_id === "string"
        ? row.employee_profile_id
        : null;

      if (!employeeProfileId) {
        return "not-present";
      }

      if (!hasLoadedTeamScopeRef.current) {
        return "team-scope-loading";
      }

      return activeTeamMemberIdsRef.current.has(employeeProfileId) ? "direct-report" : "outside-team";
    };

    const summarizeRealtimePayload = (payload: {
      eventType?: string;
      schema?: string;
      table?: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) => ({
      eventType: payload.eventType,
      schema: payload.schema,
      table: payload.table,
      hasNewRow: Boolean(payload.new && Object.keys(payload.new).length > 0),
      hasOldRow: Boolean(payload.old && Object.keys(payload.old).length > 0),
      newEmployeeProfileScope: getTeamScopeStatus(payload.new),
      oldEmployeeProfileScope: getTeamScopeStatus(payload.old),
      newStatus: typeof payload.new?.status === "string" ? payload.new.status : null,
      newCurrentReviewStage: typeof payload.new?.current_review_stage === "string"
        ? payload.new.current_review_stage
        : null,
      oldStatus: typeof payload.old?.status === "string" ? payload.old.status : null,
      oldCurrentReviewStage: typeof payload.old?.current_review_stage === "string"
        ? payload.old.current_review_stage
        : null
    });

    const shouldRefreshForPayload = (payload: {
      eventType?: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) => {
      if (payload.eventType === "INSERT") {
        return shouldRefreshForEvent(payload.new);
      }

      if (payload.eventType === "DELETE") {
        return shouldRefreshForEvent(payload.old);
      }

      return shouldRefreshForEvent(payload.new) || shouldRefreshForEvent(payload.old);
    };

    const handleRealtimePayload = (payload: {
      eventType?: string;
      schema?: string;
      table?: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) => {
      const isRelevant = shouldRefreshForPayload(payload);

      logRealtimeDebug("received reimbursement_requests payload", {
        ...summarizeRealtimePayload(payload),
        consideredRelevant: isRelevant
      });

      if (!isRelevant) {
        logRealtimeDebug("dashboard refetch skipped for non-team payload");
        return;
      }

      logRealtimeDebug("dashboard refetch triggered");
      void refreshPendingTeamRequests();
    };

    // Supabase project setup: public.reimbursement_requests must be enabled for Realtime publication.
    const channel = supabase
      .channel(`line-manager-dashboard:${profileData.employeeProfileId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reimbursement_requests" },
        handleRealtimePayload
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reimbursement_requests" },
        handleRealtimePayload
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reimbursement_requests" },
        handleRealtimePayload
      )
      .subscribe((status) => {
        logRealtimeDebug("channel subscription status changed", {
          status,
          channelTopic: `line-manager-dashboard:${profileData.employeeProfileId}`
        });
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profileData.employeeProfileId, refreshPendingTeamRequests]);

  const requestYears = Array.from(new Set(
    teamRequests
      .map((request) => request.submittedAt ? new Date(request.submittedAt).getFullYear().toString() : "")
      .filter(Boolean)
  )).sort((firstYear, secondYear) => Number(secondYear) - Number(firstYear));

  const filteredRequests = teamRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || req.category.toLowerCase() === filterType;
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const submittedYear = req.submittedAt ? new Date(req.submittedAt).getFullYear().toString() : "";
    const matchesYear = filterYear === "all" || submittedYear === filterYear;
    return matchesSearch && matchesType && matchesStatus && matchesYear;
  });

  const actionablePendingRequests = teamRequests.filter(
    r => r.status === "pending" && isLineManagerReviewStage(r.currentReviewStage)
  );
  const notificationPendingRequestCount = requestsError ? 0 : actionablePendingRequests.length;
  const pendingRequests = filteredRequests.filter(
    r => r.status === "pending" && isLineManagerDashboardReviewStage(r.currentReviewStage)
  );
  const hasActiveFilters = searchQuery !== "" || filterType !== "all" || filterStatus !== "all" || filterYear !== "all";
  const approvedRequestsTrend = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - (5 - index));

    return {
      key: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`,
      month: monthDate.toLocaleString("en-US", { month: "short" }),
      approved: 0
    };
  });
  const approvedRequestsByMonth = new Map(approvedRequestsTrend.map((month) => [month.key, month]));
  teamActivityRequests.forEach((request) => {
    if (request.status !== "approved" || !request.activityAt) {
      return;
    }

    const activityDate = new Date(request.activityAt);
    const monthKey = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, "0")}`;
    const trendMonth = approvedRequestsByMonth.get(monthKey);

    if (trendMonth) {
      trendMonth.approved += 1;
    }
  });
  const isLineManagerSignedOff = (request: any) =>
    request.status === "pending" && isHrAdminReviewStage(request.currentReviewStage);
  const canShowLineManagerActions = (request: any) =>
    request.status === "pending" && isLineManagerReviewStage(request.currentReviewStage);
  const requestQueueEmptyPanelClass = "border-2 border-muted bg-muted/20 shadow-none";
  const requestQueueEmptyPanelContentClass = "flex min-h-[236px] flex-col items-center justify-center px-6 py-12 text-center sm:p-14";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterYear("all");
  };

  const handleApprove = async (request: LineManagerRequest) => {
    if (!supabase || !request.requestId || approvingRequestId) {
      return;
    }

    const nextReviewStage = getHrAdminReviewStage();

    try {
      setApprovingRequestId(request.requestId);
      setSignOffError("");

      const { data: appUserId, error: appUserError } = await supabase.rpc("current_app_user_id");
      logLineManagerSignOffDebug("current_app_user_id", request.requestId, {
        rowCount: appUserId ? 1 : 0,
        hasError: Boolean(appUserError)
      });

      if (appUserError || !appUserId) {
        logLineManagerSignOffError("current_app_user_id", request.requestId, appUserError);
        throw new Error(appUserError?.message ?? "Unable to identify the current user.");
      }

      const { data: decision, error: decisionError } = await supabase
        .from("reimbursement_decisions")
        .insert({
          reimbursement_request_id: request.requestId,
          review_stage: "line_manager_review",
          decision_type: "sign_off",
          decided_by_user_id: appUserId
        })
        .select("reimbursement_decision_id")
        .single();
      logLineManagerSignOffDebug("insert_line_manager_decision", request.requestId, {
        rowCount: decision ? 1 : 0,
        hasError: Boolean(decisionError),
        reviewStage: "line_manager_review",
        decisionType: "sign_off"
      });

      if (decisionError) {
        logLineManagerSignOffError("insert_line_manager_decision", request.requestId, decisionError);
        throw new Error(decisionError.message);
      }

      const { data: updatedRequest, error: updateError } = await supabase
        .from("reimbursement_requests")
        .update({
          status: "pending",
          current_review_stage: nextReviewStage
        })
        .eq("reimbursement_request_id", request.requestId)
        .eq("status", "pending")
        .eq("current_review_stage", request.currentReviewStage)
        .select("reimbursement_request_id, status, current_review_stage")
        .maybeSingle();
      logLineManagerSignOffDebug("update_request_review_stage", request.requestId, {
        rowCount: updatedRequest ? 1 : 0,
        hasError: Boolean(updateError),
        fromStatus: "pending",
        toStatus: "pending",
        fromReviewStage: request.currentReviewStage,
        toReviewStage: nextReviewStage
      });

      if (updateError) {
        logLineManagerSignOffError("update_request_review_stage", request.requestId, updateError);
        throw new Error(updateError.message);
      }

      if (!updatedRequest) {
        logLineManagerSignOffError("update_request_review_stage_zero_rows", request.requestId, {
          message: "No pending line-manager review row was updated. The request may be stale or outside the current line manager scope.",
          details: `Expected current_review_stage=${request.currentReviewStage}, next_review_stage=${nextReviewStage}, decision_id=${decision?.reimbursement_decision_id ?? "not-created"}`
        });
        throw new Error("No request row was updated.");
      }

      const { data: history, error: historyError } = await supabase
        .from("reimbursement_history")
        .insert({
          reimbursement_request_id: request.requestId,
          event_type: "line_manager_signed_off",
          previous_status: "pending",
          new_status: "pending",
          performed_by_user_id: appUserId,
          event_note: "Line manager signed off for HR/Admin review."
        })
        .select("reimbursement_history_id")
        .single();
      logLineManagerSignOffDebug("insert_line_manager_history", request.requestId, {
        rowCount: history ? 1 : 0,
        hasError: Boolean(historyError),
        eventType: "line_manager_signed_off"
      });

      if (historyError) {
        logLineManagerSignOffError("insert_line_manager_history", request.requestId, historyError);
        throw new Error(historyError.message);
      }

      setTeamRequests((currentRequests) => currentRequests.map((teamRequest) => (
        teamRequest.requestId === request.requestId
          ? {
            ...teamRequest,
            status: updatedRequest.status,
            currentReviewStage: updatedRequest.current_review_stage
          }
          : teamRequest
      )));
      setTeamActivityRequests((currentRequests) => currentRequests.map((teamRequest) => (
        teamRequest.requestId === request.requestId
          ? {
            ...teamRequest,
            status: updatedRequest.status,
            currentReviewStage: updatedRequest.current_review_stage,
            activityAt: new Date().toISOString()
          }
          : teamRequest
      )));
      setIsDetailsOpen(false);
      setSelectedRequest(null);
      void refreshPendingTeamRequests();
    } catch (error) {
      console.error("Line manager sign-off could not be completed.", error);
      setSignOffError("Unable to sign off this request. Please try again.");
    } finally {
      setApprovingRequestId(null);
    }
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

  const createDocumentSignedUrl = async (
    uploadedDocument: LineManagerDocument,
    options?: { download?: boolean }
  ) => {
    if (!supabase || !uploadedDocument.storagePath) {
      throw new Error("Document storage details are not available.");
    }

    const { data, error } = await supabase.storage
      .from(uploadedDocument.storageBucket)
      .createSignedUrl(uploadedDocument.storagePath, signedDocumentUrlExpirySeconds, {
        download: options?.download ? uploadedDocument.fileName : false
      });

    if (error) {
      throw new Error(error.message);
    }

    return data.signedUrl;
  };

  const handlePreviewDocument = async (uploadedDocument: LineManagerDocument, label: string) => {
    setPreviewDocument({
      ...uploadedDocument,
      label,
      url: null,
      isLoading: true,
      error: null
    });

    try {
      const signedUrl = await createDocumentSignedUrl(uploadedDocument);
      setPreviewDocument((currentPreview) => (
        currentPreview?.id === uploadedDocument.id
          ? { ...currentPreview, url: signedUrl, isLoading: false, error: null }
          : currentPreview
      ));
    } catch (error) {
      console.error("Document preview could not be loaded.", error);
      setPreviewDocument((currentPreview) => (
        currentPreview?.id === uploadedDocument.id
          ? {
            ...currentPreview,
            url: null,
            isLoading: false,
            error: "Unable to load document preview. Please try again or download the file."
          }
          : currentPreview
      ));
    }
  };

  const handleDownloadDocument = async (uploadedDocument: LineManagerDocument) => {
    try {
      const signedUrl = await createDocumentSignedUrl(uploadedDocument, { download: true });
      const downloadLink = document.createElement("a");
      downloadLink.href = signedUrl;
      downloadLink.download = uploadedDocument.fileName;
      downloadLink.rel = "noopener noreferrer";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (error) {
      console.error("Document download could not be started.", error);
      window.alert("This document could not be downloaded right now. Please try again.");
    }
  };

  const renderDocumentPreviewContent = (documentToPreview: PreviewDocumentState) => {
    if (documentToPreview.isLoading) {
      return (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-gray-100 p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading document preview...</p>
        </div>
      );
    }

    if (documentToPreview.error) {
      return (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-gray-100 p-6 text-center">
          <p className="text-sm text-muted-foreground">{documentToPreview.error}</p>
        </div>
      );
    }

    const previewKind = getDocumentPreviewKind(documentToPreview);

    if (!documentToPreview.url || previewKind === "unsupported") {
      return (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg bg-gray-100 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Preview is not available for this file type. Please download the document.
          </p>
        </div>
      );
    }

    if (previewKind === "image") {
      return (
        <div className="flex max-h-[520px] min-h-[420px] items-center justify-center overflow-auto rounded-lg bg-gray-100 p-4">
          <img
            src={documentToPreview.url}
            alt={`${documentToPreview.label} preview`}
            className="max-h-full max-w-full object-contain"
            onError={() => {
              setPreviewDocument((currentPreview) => (
                currentPreview?.id === documentToPreview.id
                  ? {
                    ...currentPreview,
                    error: "Unable to load document preview. Please try again or download the file."
                  }
                  : currentPreview
              ));
            }}
          />
        </div>
      );
    }

    return (
      <iframe
        title={`${documentToPreview.label} preview`}
        src={documentToPreview.url}
        className="h-[520px] w-full rounded-lg border bg-white"
        onError={() => {
          setPreviewDocument((currentPreview) => (
            currentPreview?.id === documentToPreview.id
              ? {
                ...currentPreview,
                error: "Unable to load document preview. Please try again or download the file."
              }
              : currentPreview
          ));
        }}
      />
    );
  };

  const renderDocumentPreviewPanel = (documentToPreview: PreviewDocumentState, isMobile = false) => (
    <div className={isMobile ? "space-y-4" : "space-y-4"}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Document Preview</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreviewDocument(null)}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <p className="font-medium text-gray-700">{documentToPreview.label}</p>
        <p className="text-sm text-gray-500">{documentToPreview.fileName}</p>
      </div>
      {renderDocumentPreviewContent(documentToPreview)}
      <Button
        variant="outline"
        size="sm"
        className={isMobile ? "w-full" : ""}
        onClick={() => void handleDownloadDocument(documentToPreview)}
        disabled={!documentToPreview.storagePath}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Document
      </Button>
    </div>
  );

  const getTypeBadge = (category: string) => {
    const isOpticalCategory = category.toLowerCase() === "optical";

    return (
      <Badge className={isOpticalCategory ? "bg-sky-50 text-sky-500 border-sky-100" : "bg-purple-100 text-purple-600 border-purple-200"}>
        {category}
      </Badge>
    );
  };

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
          Approved by LM • Pending HR Review
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
                {notificationPendingRequestCount > 0 && (
                  <span
                    className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"
                    aria-label={`${notificationPendingRequestCount} pending reimbursement request${notificationPendingRequestCount === 1 ? "" : "s"}`}
                  />
                )}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-36 bg-white">
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
                          <SelectItem value="declined">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className="w-32 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {requestYears.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
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
                  <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="text-xs font-medium text-primary">
                      {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm text-gray-600">
                      {searchQuery && `Search: ${searchQuery}`}
                      {searchQuery && (filterType !== "all" || filterStatus !== "all" || filterYear !== "all") && " • "}
                      {filterType !== "all" && `Type: ${filterType}`}
                      {filterType !== "all" && (filterStatus !== "all" || filterYear !== "all") && " • "}
                      {filterStatus !== "all" && `Status: ${filterStatus}`}
                      {filterStatus !== "all" && filterYear !== "all" && " • "}
                      {filterYear !== "all" && `Year: ${filterYear}`}
                    </span>
                  </div>
                )}

                {signOffError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">{signOffError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {isRequestsLoading ? (
                    <Card className={requestQueueEmptyPanelClass}>
                      <CardContent className={requestQueueEmptyPanelContentClass}>
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
                    <Card className={requestQueueEmptyPanelClass}>
                      <CardContent className={requestQueueEmptyPanelContentClass}>
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
                    pendingRequests.map((request) => {
                      const isOpticalRequest = request.category.toLowerCase() === "optical";
                      const requestCardClass = isOpticalRequest
                        ? "border-2 border-l-4 border-primary/10 border-l-blue-500"
                        : "border-2 border-l-4 border-primary/10 border-l-purple-500";
                      const secondaryButtonClass = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900";

                      return (
                        <Card key={request.id} className={requestCardClass}>
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                              <div className="flex items-start gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold">{request.employeeName}</h3>
                                    {getTypeBadge(request.category)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {request.employeeId} • {request.department}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(request)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">{isOpticalRequest ? "Total Eye Care" : "Total Medicines"}</label>
                                <p className="font-medium">{request.medicines.length} item{request.medicines.length !== 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Total Receipts</label>
                                <p>{request.receipts.length} receipt{request.receipts.length !== 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Amount</label>
                                <p className="font-semibold text-lg">₱{request.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Submitted</label>
                                <p>{request.requestDate}</p>
                              </div>
                            </div>

                            {request.notes && (
                              <div className="bg-muted/20 p-3 rounded-md mb-4">
                                <label className="text-sm font-medium text-gray-600">Notes</label>
                                <p className="text-sm">{request.notes}</p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className={secondaryButtonClass}
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
                                    variant="outline"
                                    size="sm"
                                    className={secondaryButtonClass}
                                    onClick={() => openDeclineModal(request)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deny Request
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => void handleApprove(request)}
                                    disabled={approvingRequestId === request.requestId}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {approvingRequestId === request.requestId ? "Signing Off..." : "Sign Off for HR/Admin Review"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Notifications */}
            <Card className="rounded-xl border-2 border-yellow-300 bg-yellow-50/70 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isRequestsLoading ? (
                  <div className="p-3 bg-white rounded-lg border border-yellow-200 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground opacity-60 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading alerts...</p>
                  </div>
                ) : requestsError ? (
                  <div className="p-3 bg-white rounded-lg border border-yellow-200 text-center">
                    <p className="text-sm text-muted-foreground">Unable to retrieve data. Please refresh the page.</p>
                  </div>
                ) : actionablePendingRequests.length === 0 ? (
                  <div className="p-3 bg-white rounded-lg border border-yellow-200 text-center">
                    <p className="text-sm font-medium">No alerts</p>
                    <p className="text-xs text-muted-foreground">No team requests need line manager action right now.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-yellow-300 bg-white p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">Pending Approvals</p>
                        <p className="text-xs text-gray-500">
                          {actionablePendingRequests.length} request{actionablePendingRequests.length !== 1 ? "s" : ""} awaiting review
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Insights */}
            <Card className="rounded-[16px] shadow-[0_3px_16px_rgba(191,191,191,0.16)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Team Insights
                </CardTitle>
                <CardDescription>Approved requests trend (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                {isRequestsLoading ? (
                  <div className="p-3 bg-muted/20 rounded-lg border text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground opacity-60 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading team insights...</p>
                  </div>
                ) : requestsError ? (
                  <div className="p-3 bg-muted/20 rounded-lg border text-center">
                    <p className="text-sm text-muted-foreground">Unable to retrieve data. Please refresh the page.</p>
                  </div>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={approvedRequestsTrend} margin={{ top: 5, right: 5, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#B4D3E2" opacity={0.3} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#0B8BCB", fontSize: 10 }}
                          angle={-15}
                          textAnchor="end"
                          height={45}
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#0B8BCB", fontSize: 10 }}
                          width={36}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "2px solid #B4D3E2",
                            borderRadius: "8px"
                          }}
                          formatter={(value) => [`${value} approved`, "Requests"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="approved"
                          stroke="#0B8BCB"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#0B8BCB", stroke: "#0B8BCB", strokeWidth: 2 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
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
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
        if (!open) {
          setPreviewDocument(null);
        }
      }}>
        <DialogContent className={`w-full ${previewDocument ? "sm:min-w-[1120px] sm:max-w-[1120px]" : "sm:min-w-[860px] sm:max-w-[860px]"} max-h-[90vh] overflow-hidden`}>
          <DialogHeader>
            <DialogTitle>Reimbursement Request Details</DialogTitle>
            <DialogDescription>
              Complete information for request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className={`${previewDocument ? "sm:grid sm:grid-cols-[minmax(0,1fr)_420px] sm:gap-6" : ""} max-h-[calc(90vh-120px)] overflow-y-auto`}>
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
                  {selectedRequest.uploadedDocuments.map((uploadedDocument: LineManagerDocument, index: number) => {
                    const documentNumber = selectedRequest.uploadedDocuments
                      .slice(0, index + 1)
                      .filter((document: LineManagerDocument) => document.type === uploadedDocument.type)
                      .length;
                    const documentLabel = uploadedDocument.type === "prescription"
                      ? "Prescription"
                      : `Receipt ${documentNumber}`;
                    const documentCardClasses = uploadedDocument.type === "prescription"
                      ? "p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2"
                      : "p-3 bg-green-50 border border-green-200 rounded-lg space-y-2";
                    const documentIconClasses = uploadedDocument.type === "prescription"
                      ? "h-4 w-4 text-blue-600"
                      : "h-4 w-4 text-green-600";

                    return (
                      <div key={uploadedDocument.id} className={documentCardClasses}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className={documentIconClasses} />
                            <span className="text-sm font-medium">{documentLabel}: {uploadedDocument.fileName}</span>
                          </div>
                        </div>
                        {uploadedDocument.invoiceNumber && (
                          <div className="ml-6 text-xs text-muted-foreground">
                            Invoice: {uploadedDocument.invoiceNumber}
                          </div>
                        )}
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => void handlePreviewDocument(uploadedDocument, documentLabel)}
                            disabled={!uploadedDocument.storagePath}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => void handleDownloadDocument(uploadedDocument)}
                            disabled={!uploadedDocument.storagePath}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
                <div className="space-y-3 pt-4">
                  {signOffError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">{signOffError}</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-3">
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
                      onClick={() => void handleApprove(selectedRequest)}
                      disabled={approvingRequestId === selectedRequest.requestId}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {approvingRequestId === selectedRequest.requestId ? "Signing Off..." : "Sign Off for HR/Admin Review"}
                    </Button>
                  </div>
                </div>
              )}
              </div>

              {previewDocument && (
                <div className="hidden sm:block sm:border-l sm:pl-6">
                  {renderDocumentPreviewPanel(previewDocument)}
                </div>
              )}

              {previewDocument && (
                <div className="sm:hidden fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
                  {renderDocumentPreviewPanel(previewDocument, true)}
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
