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
  X as XIcon,
  Building2,
  FilterX
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { supabase } from "../../lib/supabase";

interface AdminDashboardProps {
  onLogout: () => void;
  adminProfile: AdminProfileData;
}

export interface AdminProfileData {
  name: string;
  id: string;
  designation: string;
  department: string;
  email: string;
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
  employee_profiles?: {
    departments?: { name?: string | null } | { name?: string | null }[] | null;
  } | {
    departments?: { name?: string | null } | { name?: string | null }[] | null;
  }[] | null;
}

interface AdminMonthlySummaryRequestRow {
  reimbursement_request_id: string;
  category: ReimbursementCategory;
  status: string;
  current_review_stage: string;
  submitted_at: string | null;
  claim_amount: number | string | null;
}

interface AdminRecentActivityRow {
  reimbursement_request_id: string;
  request_number: string | null;
  request_reference_number: string | null;
  category: ReimbursementCategory;
  status: string;
  current_review_stage: string;
  submitted_at: string;
  claim_amount: number | string | null;
  employee_profiles?: {
    full_name?: string | null;
  } | {
    full_name?: string | null;
  }[] | null;
}

interface AdminRequestRow {
  reimbursement_request_id: string;
  request_number: string | null;
  request_reference_number: string | null;
  employee_profile_id: string;
  category: ReimbursementCategory;
  status: string;
  current_review_stage: string;
  submitted_at: string;
  claim_amount: number | string | null;
  notes: string | null;
  employee_profiles?: {
    employee_number?: string | null;
    full_name?: string | null;
    designation?: string | null;
    departments?: { name?: string | null } | { name?: string | null }[] | null;
  } | {
    employee_number?: string | null;
    full_name?: string | null;
    designation?: string | null;
    departments?: { name?: string | null } | { name?: string | null }[] | null;
  }[] | null;
}

interface AdminRequestItemRow {
  reimbursement_request_item_id: string;
  reimbursement_request_id: string;
  item_name: string;
  quantity: number | string | null;
  unit_price: number | string | null;
  subtotal_amount: number | string | null;
}

interface AdminRequestReceiptRow {
  reimbursement_receipt_id: string;
  reimbursement_request_id: string;
  invoice_number: string;
  is_pwd: boolean;
  vat_exemption_amount: number | string | null;
  pwd_discount_amount: number | string | null;
  reimbursement_documents?: {
    reimbursement_document_id?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
    storage_bucket?: string | null;
    storage_path?: string | null;
  } | {
    reimbursement_document_id?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
    storage_bucket?: string | null;
    storage_path?: string | null;
  }[] | null;
}

interface AdminRequestDocumentRow {
  reimbursement_document_id: string;
  reimbursement_request_id: string;
  file_name: string;
  mime_type: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
}

interface AdminRequestDecisionRow {
  reimbursement_request_id: string;
  decision_reason_text: string | null;
  decision_reason_code: string | null;
}

const adminOverviewErrorMessage = "Unable to retrieve data. Please refresh the page.";
const missingDepartmentLabel = "Unassigned";
const signedDocumentUrlExpirySeconds = 60 * 5;
const adminPendingStatus = "pending";
const adminApprovedStatus = "approved";
const adminDeniedStatus = "denied";
const lineManagerReviewStage = "line_manager_review";
const hrAdminReviewStage = "hr_admin_review";
const completedReviewStage = "completed";

interface DepartmentBreakdownRow {
  department: string;
  requestCount: number;
  medicineRequestCount: number;
  opticalRequestCount: number;
  medicine: number;
  optical: number;
  totalAmount: number;
}

interface RecentActivityItem {
  id: string;
  referenceNumber: string;
  employeeName: string;
  category: ReimbursementCategory;
  submittedDate: string;
  status: string;
  currentReviewStage: string;
  totalPrice: number;
}

interface MonthlySummaryRow {
  monthKey: string;
  monthLabel: string;
  requestCount: number;
  pendingCount: number;
  approvedCount: number;
  deniedCount: number;
  requestedAmount: number;
  approvedAmount: number;
  medicineApprovedAmount: number;
  opticalApprovedAmount: number;
}

interface AdminRequestUiItem {
  id: string;
  name: string;
  quantity: string;
  unitPrice: string;
  subtotal: number;
}

interface AdminRequestUiReceipt {
  id: string;
  fileName: string;
  invoiceNumber: string;
  isPWD: boolean;
  vatExemption: string;
  pwdDiscount: string;
  mimeType: string | null;
  storageBucket: string;
  storagePath: string | null;
}

interface AdminRequestUiDocument {
  id: string;
  type: "prescription" | "receipt";
  name: string;
  fileName: string;
  mimeType: string | null;
  storageBucket: string;
  storagePath: string | null;
  index?: number;
}

interface AdminRequestUiModel {
  id: string;
  referenceNumber: string;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  submittedDate: string;
  status: string;
  currentReviewStage: string;
  category: ReimbursementCategory;
  submittedYear: string | null;
  prescription: AdminRequestUiDocument;
  medicines: AdminRequestUiItem[];
  receipts: AdminRequestUiReceipt[];
  notes: string;
  totalPrice: number;
  remarks?: string;
}

interface AdminPreviewDocumentState extends AdminRequestUiDocument {
  url: string | null;
  isLoading: boolean;
  error: string | null;
}

const getRelatedRecord = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const getRequestDepartmentName = (request: AdminOverviewRequestRow) => {
  const employeeProfile = getRelatedRecord(request.employee_profiles);
  const department = getRelatedRecord(employeeProfile?.departments);
  const departmentName = department?.name?.trim();

  return departmentName || missingDepartmentLabel;
};

const isApprovedByHr = (request: AdminOverviewRequestRow) => (
  request.status === "approved" && request.current_review_stage === "completed"
);

const getCalendarMonthKey = (date: Date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
);

const getCalendarMonthLabel = (date: Date) => (
  date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long"
  })
);

const createMonthlySummaryRows = (requests: AdminMonthlySummaryRequestRow[]): MonthlySummaryRow[] => {
  const summariesByMonth = new Map<string, MonthlySummaryRow>();

  requests.forEach((request) => {
    if (!request.submitted_at || (request.category !== "medicine" && request.category !== "optical")) {
      return;
    }

    const submittedDate = new Date(request.submitted_at);
    if (Number.isNaN(submittedDate.getTime())) {
      return;
    }

    const monthKey = getCalendarMonthKey(submittedDate);
    const existing = summariesByMonth.get(monthKey) ?? {
      monthKey,
      monthLabel: getCalendarMonthLabel(submittedDate),
      requestCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      deniedCount: 0,
      requestedAmount: 0,
      approvedAmount: 0,
      medicineApprovedAmount: 0,
      opticalApprovedAmount: 0
    };

    const amount = Number(request.claim_amount ?? 0);

    existing.requestCount += 1;
    existing.requestedAmount += amount;

    if (request.status === "pending") {
      existing.pendingCount += 1;
    } else if (request.status === "denied" || request.status === "declined") {
      existing.deniedCount += 1;
    } else if (request.status === "approved" && request.current_review_stage === "completed") {
      existing.approvedCount += 1;
      existing.approvedAmount += amount;

      if (request.category === "medicine") {
        existing.medicineApprovedAmount += amount;
      } else {
        existing.opticalApprovedAmount += amount;
      }
    }

    summariesByMonth.set(monthKey, existing);
  });

  return Array.from(summariesByMonth.values())
    .sort((first, second) => second.monthKey.localeCompare(first.monthKey));
};

const createDepartmentBreakdown = (requests: AdminOverviewRequestRow[]): DepartmentBreakdownRow[] => {
  const breakdownByDepartment = new Map<string, DepartmentBreakdownRow>();

  requests.forEach((request) => {
    if (!isApprovedByHr(request) || (request.category !== "medicine" && request.category !== "optical")) {
      return;
    }

    const department = getRequestDepartmentName(request);
    const amount = Number(request.claim_amount ?? 0);
    const existing = breakdownByDepartment.get(department) ?? {
      department,
      requestCount: 0,
      medicineRequestCount: 0,
      opticalRequestCount: 0,
      medicine: 0,
      optical: 0,
      totalAmount: 0
    };

    existing.requestCount += 1;
    existing.totalAmount += amount;

    if (request.category === "medicine") {
      existing.medicineRequestCount += 1;
      existing.medicine += amount;
    } else {
      existing.opticalRequestCount += 1;
      existing.optical += amount;
    }

    breakdownByDepartment.set(department, existing);
  });

  return Array.from(breakdownByDepartment.values())
    .filter((department) => department.requestCount > 0)
    .sort((first, second) => second.totalAmount - first.totalAmount || first.department.localeCompare(second.department));
};

const formatSubmittedDate = (submittedAt: string) => {
  const submittedDate = new Date(submittedAt);

  if (Number.isNaN(submittedDate.getTime())) {
    return submittedAt;
  }

  return submittedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const getDocumentExtension = (fileName: string) => (
  fileName.split(".").pop()?.toLowerCase() ?? ""
);

const getDocumentPreviewKind = (uploadedDocument: Pick<AdminRequestUiDocument, "fileName" | "mimeType">) => {
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

const getCategoryLabel = (category: ReimbursementCategory) => (
  category === "medicine" ? "Medicine" : "Optical"
);

const formatPesoAmount = (amount: number) => (
  `₱${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
);

const isUuid = (value: string) => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
);

const isAdminRelevantRequest = (request: Pick<AdminRequestUiModel, "status" | "currentReviewStage">) => (
  (request.status === adminPendingStatus && request.currentReviewStage === hrAdminReviewStage) ||
  (request.status === adminApprovedStatus && request.currentReviewStage === completedReviewStage) ||
  (request.status === adminDeniedStatus && request.currentReviewStage === completedReviewStage)
);

const requestFilterSelectItemClass = "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary";

const getSubmittedYear = (submittedAt: string) => {
  const submittedDate = new Date(submittedAt);

  if (Number.isNaN(submittedDate.getTime())) {
    return null;
  }

  return String(submittedDate.getFullYear());
};

const createRecentActivityItems = (requests: AdminRecentActivityRow[]): RecentActivityItem[] => (
  requests.map((request) => {
    const employeeProfile = getRelatedRecord(request.employee_profiles);

    return {
      id: request.reimbursement_request_id,
      referenceNumber: request.request_reference_number || request.request_number || request.reimbursement_request_id,
      employeeName: employeeProfile?.full_name?.trim() || "Unknown Employee",
      category: request.category,
      submittedDate: formatSubmittedDate(request.submitted_at),
      status: request.status,
      currentReviewStage: request.current_review_stage,
      totalPrice: Number(request.claim_amount ?? 0)
    };
  })
);

const groupByRequestId = <T extends { reimbursement_request_id: string }>(rows: T[]) => {
  const groupedRows = new Map<string, T[]>();

  rows.forEach((row) => {
    const requestRows = groupedRows.get(row.reimbursement_request_id) ?? [];
    requestRows.push(row);
    groupedRows.set(row.reimbursement_request_id, requestRows);
  });

  return groupedRows;
};

const createAdminRequestUiModels = ({
  requests,
  items,
  receipts,
  prescriptions,
  decisions
}: {
  requests: AdminRequestRow[];
  items: AdminRequestItemRow[];
  receipts: AdminRequestReceiptRow[];
  prescriptions: AdminRequestDocumentRow[];
  decisions: AdminRequestDecisionRow[];
}): AdminRequestUiModel[] => {
  const itemsByRequestId = groupByRequestId(items);
  const receiptsByRequestId = groupByRequestId(receipts);
  const prescriptionsByRequestId = groupByRequestId(prescriptions);
  const decisionsByRequestId = groupByRequestId(decisions);

  return requests.map((request) => {
    const employeeProfile = getRelatedRecord(request.employee_profiles);
    const department = getRelatedRecord(employeeProfile?.departments);
    const requestItems = itemsByRequestId.get(request.reimbursement_request_id) ?? [];
    const requestReceipts = receiptsByRequestId.get(request.reimbursement_request_id) ?? [];
    const requestPrescription = prescriptionsByRequestId.get(request.reimbursement_request_id)?.[0];
    const requestDecision = decisionsByRequestId.get(request.reimbursement_request_id)?.[0];
    const remarks = requestDecision?.decision_reason_text || requestDecision?.decision_reason_code || undefined;

    return {
      id: request.reimbursement_request_id,
      referenceNumber: request.request_reference_number || request.request_number || request.reimbursement_request_id,
      employeeName: employeeProfile?.full_name?.trim() || "Unknown Employee",
      employeeId: employeeProfile?.employee_number?.trim() || "Unassigned",
      department: department?.name?.trim() || missingDepartmentLabel,
      designation: employeeProfile?.designation?.trim() || "Unassigned",
      submittedDate: formatSubmittedDate(request.submitted_at),
      status: request.status,
      currentReviewStage: request.current_review_stage,
      category: request.category,
      submittedYear: getSubmittedYear(request.submitted_at),
      prescription: {
        id: requestPrescription?.reimbursement_document_id || `${request.reimbursement_request_id}-prescription`,
        type: "prescription",
        name: requestPrescription?.file_name || "No prescription uploaded",
        fileName: requestPrescription?.file_name || "No prescription uploaded",
        mimeType: requestPrescription?.mime_type ?? null,
        storageBucket: requestPrescription?.storage_bucket ?? "reimbursement-documents",
        storagePath: requestPrescription?.storage_path ?? null
      },
      medicines: requestItems.map((item) => ({
        id: item.reimbursement_request_item_id,
        name: item.item_name,
        quantity: Number(item.quantity ?? 0).toLocaleString(),
        unitPrice: Number(item.unit_price ?? 0).toFixed(2),
        subtotal: Number(item.subtotal_amount ?? 0)
      })),
      receipts: requestReceipts.map((receipt) => {
        const document = getRelatedRecord(receipt.reimbursement_documents);

        return {
          id: document?.reimbursement_document_id || receipt.reimbursement_receipt_id,
          fileName: document?.file_name || "Receipt file",
          invoiceNumber: receipt.invoice_number,
          isPWD: receipt.is_pwd,
          vatExemption: Number(receipt.vat_exemption_amount ?? 0).toFixed(2),
          pwdDiscount: Number(receipt.pwd_discount_amount ?? 0).toFixed(2),
          mimeType: document?.mime_type ?? null,
          storageBucket: document?.storage_bucket ?? "reimbursement-documents",
          storagePath: document?.storage_path ?? null
        };
      }),
      notes: request.notes ?? "",
      totalPrice: Number(request.claim_amount ?? 0),
      remarks
    };
  });
};

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

export function AdminDashboard({ onLogout, adminProfile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [denialReason, setDenialReason] = useState("duplicate");
  const [customDenialReason, setCustomDenialReason] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<AdminPreviewDocumentState | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [overviewMetrics, setOverviewMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [monthlySummaryRows, setMonthlySummaryRows] = useState<MonthlySummaryRow[]>([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<DepartmentBreakdownRow[]>([]);
  const [recentActivityRequests, setRecentActivityRequests] = useState<RecentActivityItem[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequestUiModel[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const loadReimbursementOverview = useCallback(async () => {
    if (!supabase) {
      setOverviewMetrics(null);
      setMonthlySummaryRows([]);
      setDepartmentBreakdown([]);
      setRecentActivityRequests([]);
      setAdminRequests([]);
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
        .select(`
          category,
          status,
          current_review_stage,
          claim_amount,
          employee_profiles(
            departments(name)
          )
        `)
        .gte("submitted_at", monthStart)
        .lt("submitted_at", nextMonthStart)
        .in("category", ["medicine", "optical"])
        .in("status", ["approved", "pending", "denied"]);

      if (error) {
        throw error;
      }

      const { data: monthlySummaryData, error: monthlySummaryError } = await supabase
        .from("reimbursement_requests")
        .select(`
          reimbursement_request_id,
          category,
          status,
          current_review_stage,
          submitted_at,
          claim_amount
        `)
        .gte("submitted_at", monthStart)
        .lt("submitted_at", nextMonthStart)
        .in("category", ["medicine", "optical"])
        .in("status", ["approved", "pending", "denied", "declined"])
        .order("submitted_at", { ascending: false });

      if (monthlySummaryError) {
        throw monthlySummaryError;
      }

      const { data: recentActivityData, error: recentActivityError } = await supabase
        .from("reimbursement_requests")
        .select(`
          reimbursement_request_id,
          request_number,
          request_reference_number,
          category,
          status,
          current_review_stage,
          submitted_at,
          claim_amount,
          employee_profiles(
            full_name
          )
        `)
        .eq("status", adminPendingStatus)
        .eq("current_review_stage", hrAdminReviewStage)
        .in("category", ["medicine", "optical"])
        .order("submitted_at", { ascending: false })
        .limit(5);

      if (recentActivityError) {
        throw recentActivityError;
      }

      const { data: requestData, error: requestError } = await supabase
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
          notes,
          employee_profiles(
            employee_number,
            full_name,
            designation,
            departments(name)
          )
        `)
        .in("status", [adminPendingStatus, adminApprovedStatus, adminDeniedStatus])
        .in("current_review_stage", [hrAdminReviewStage, completedReviewStage])
        .in("category", ["medicine", "optical"])
        .order("submitted_at", { ascending: false });

      if (requestError) {
        throw requestError;
      }

      const requestRows = ((requestData ?? []) as AdminRequestRow[]).filter((request) => (
        isAdminRelevantRequest({
          status: request.status,
          currentReviewStage: request.current_review_stage
        })
      ));
      const requestIds = requestRows.map((request) => request.reimbursement_request_id);

      const { data: requestItemsData, error: requestItemsError } = requestIds.length > 0
        ? await supabase
          .from("reimbursement_request_items")
          .select(`
            reimbursement_request_item_id,
            reimbursement_request_id,
            item_name,
            quantity,
            unit_price,
            subtotal_amount
          `)
          .in("reimbursement_request_id", requestIds)
          .order("sequence_number", { ascending: true })
        : { data: [], error: null };

      if (requestItemsError) {
        throw requestItemsError;
      }

      const { data: requestReceiptsData, error: requestReceiptsError } = requestIds.length > 0
        ? await supabase
          .from("reimbursement_receipts")
          .select(`
            reimbursement_receipt_id,
            reimbursement_request_id,
            invoice_number,
            is_pwd,
            vat_exemption_amount,
            pwd_discount_amount,
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

      if (requestReceiptsError) {
        throw requestReceiptsError;
      }

      const { data: requestPrescriptionsData, error: requestPrescriptionsError } = requestIds.length > 0
        ? await supabase
          .from("reimbursement_documents")
          .select("reimbursement_document_id, reimbursement_request_id, file_name, mime_type, storage_bucket, storage_path")
          .in("reimbursement_request_id", requestIds)
          .eq("document_type", "prescription")
          .order("uploaded_at", { ascending: true })
        : { data: [], error: null };

      if (requestPrescriptionsError) {
        throw requestPrescriptionsError;
      }

      const { data: requestDecisionsData, error: requestDecisionsError } = requestIds.length > 0
        ? await supabase
          .from("reimbursement_decisions")
          .select("reimbursement_request_id, decision_reason_text, decision_reason_code")
          .in("reimbursement_request_id", requestIds)
          .order("decided_at", { ascending: false })
        : { data: [], error: null };

      if (requestDecisionsError) {
        throw requestDecisionsError;
      }

      const nextMetrics = createEmptyOverviewMetrics();

      const overviewRequestRows = (data ?? []) as AdminOverviewRequestRow[];

      overviewRequestRows.forEach((request) => {
        const category = request.category;
        if (category !== "medicine" && category !== "optical") {
          return;
        }

        if (isApprovedByHr(request)) {
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
      setMonthlySummaryRows(createMonthlySummaryRows((monthlySummaryData ?? []) as AdminMonthlySummaryRequestRow[]));
      setDepartmentBreakdown(createDepartmentBreakdown(overviewRequestRows));
      setRecentActivityRequests(createRecentActivityItems((recentActivityData ?? []) as AdminRecentActivityRow[]));
      setAdminRequests(createAdminRequestUiModels({
        requests: requestRows,
        items: (requestItemsData ?? []) as AdminRequestItemRow[],
        receipts: (requestReceiptsData ?? []) as AdminRequestReceiptRow[],
        prescriptions: (requestPrescriptionsData ?? []) as AdminRequestDocumentRow[],
        decisions: (requestDecisionsData ?? []) as AdminRequestDecisionRow[]
      }));
    } catch (error) {
      console.error("Admin reimbursement overview could not be loaded.", error);
      setOverviewMetrics(null);
      setMonthlySummaryRows([]);
      setDepartmentBreakdown([]);
      setRecentActivityRequests([]);
      setAdminRequests([]);
      setOverviewError(adminOverviewErrorMessage);
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReimbursementOverview();
  }, [loadReimbursementOverview]);

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

  const handleApprove = async (request: AdminRequestUiModel) => {
    const requestId = request.id;

    if (!supabase || approvingRequestId) {
      return;
    }

    try {
      setApprovingRequestId(requestId);

      if (import.meta.env.DEV) {
        console.info("Admin approve RPC starting.", {
          requestId,
          referenceNumber: request.referenceNumber,
          isUuid: isUuid(requestId),
          status: request.status,
          currentReviewStage: request.currentReviewStage,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL
        });
      }

      const { data: approvedRequest, error: approvalError } = await supabase
        .rpc("admin_approve_reimbursement_request", {
          p_reimbursement_request_id: requestId,
          p_remarks: null
        })
        .maybeSingle();

      if (import.meta.env.DEV) {
        console.info("Admin approve RPC result.", {
          requestId,
          data: approvedRequest,
          error: approvalError,
          code: approvalError?.code,
          message: approvalError?.message,
          details: approvalError?.details,
          hint: approvalError?.hint
        });
      }

      if (approvalError) {
        console.error("Admin approve RPC failed.", {
          requestId,
          referenceNumber: request.referenceNumber,
          error: approvalError,
          code: approvalError.code,
          message: approvalError.message,
          details: approvalError.details,
          hint: approvalError.hint
        });
        throw new Error(approvalError.message);
      }

      if (
        !approvedRequest ||
        approvedRequest.status !== adminApprovedStatus ||
        approvedRequest.current_review_stage !== completedReviewStage
      ) {
        console.error("Admin approval RPC returned an unexpected result.", approvedRequest);
        throw new Error("The reimbursement request was not approved.");
      }

      setIsViewDialogOpen(false);
      setSelectedRequest(null);
      await loadReimbursementOverview();
    } catch (error) {
      console.error("Admin approval could not be completed.", error);
      window.alert("Unable to approve this request. Please try again.");
    } finally {
      setApprovingRequestId(null);
    }
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

  const createDocumentSignedUrl = async (
    uploadedDocument: AdminRequestUiDocument,
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

  const handlePreviewDocument = async (uploadedDocument: AdminRequestUiDocument) => {
    setPreviewDocument({
      ...uploadedDocument,
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
      console.error("Admin document preview could not be loaded.", error);
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

  const handleDownloadDocument = async (uploadedDocument: AdminRequestUiDocument) => {
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
      console.error("Admin document download could not be started.", error);
      window.alert("This document could not be downloaded right now. Please try again.");
    }
  };

  const renderDocumentPreviewContent = (documentToPreview: AdminPreviewDocumentState) => {
    if (documentToPreview.isLoading) {
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-100 p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading document preview...</p>
        </div>
      );
    }

    if (documentToPreview.error) {
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-100 p-6 text-center">
          <p className="text-sm text-muted-foreground">{documentToPreview.error}</p>
        </div>
      );
    }

    const previewKind = getDocumentPreviewKind(documentToPreview);

    if (!documentToPreview.url || previewKind === "unsupported") {
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-100 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Preview is not available for this file type. Please download the document.
          </p>
        </div>
      );
    }

    if (previewKind === "image") {
      return (
        <div className="flex max-h-[500px] min-h-[400px] items-center justify-center overflow-auto rounded-lg bg-gray-100 p-4">
          <img
            src={documentToPreview.url}
            alt={`${documentToPreview.name} preview`}
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
        title={`${documentToPreview.name} preview`}
        src={documentToPreview.url}
        className="h-[500px] w-full rounded-lg border bg-white"
      />
    );
  };

  const renderDocumentPreviewPanel = (documentToPreview: AdminPreviewDocumentState, isMobile = false) => (
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
      <div>
        <p className="font-medium text-gray-700">
          {documentToPreview.type === "prescription"
            ? "Prescription"
            : `Receipt ${(documentToPreview.index ?? 0) + 1}`}
        </p>
        <p className="text-sm text-gray-500">{documentToPreview.name}</p>
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

  const filteredRequests = adminRequests.filter(request => {
    if (!isAdminRelevantRequest(request) || request.currentReviewStage === lineManagerReviewStage) {
      return false;
    }

    const statusMatch =
      (filterStatus === "all" && isAdminRelevantRequest(request)) ||
      (filterStatus === adminPendingStatus && request.status === adminPendingStatus && request.currentReviewStage === hrAdminReviewStage) ||
      (filterStatus === adminApprovedStatus && request.status === adminApprovedStatus && request.currentReviewStage === completedReviewStage) ||
      (filterStatus === adminDeniedStatus && request.status === adminDeniedStatus && request.currentReviewStage === completedReviewStage);
    const typeMatch = filterType === "all" || request.category === filterType;
    const departmentMatch = filterDepartment === "all" || request.department === filterDepartment;
    const yearMatch = filterYear === "all" || request.submittedYear === filterYear;
    return typeMatch && statusMatch && departmentMatch && yearMatch;
  });

  const clearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setFilterDepartment("all");
    setFilterYear("all");
  };

  const hasActiveFilters = filterType !== "all" || filterStatus !== "all" || filterDepartment !== "all" || filterYear !== "all";

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
  const currentMonthlySummary = monthlySummaryRows[0] ?? null;
  const monthlySummaryMedicineReimbursed = currentMonthlySummary?.medicineApprovedAmount ?? 0;
  const monthlySummaryOpticalReimbursed = currentMonthlySummary?.opticalApprovedAmount ?? 0;
  const monthlySummaryTotalReimbursed = currentMonthlySummary?.approvedAmount ?? 0;

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
                  {getInitials(adminProfile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="font-medium">{adminProfile.name}</p>
                <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>{adminProfile.designation}</p>
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
              Requests ({adminRequests.length})
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
                  {isOverviewLoading ? (
                    <div className="h-[350px] flex items-center justify-center" role="status" aria-live="polite">
                      <p className="text-sm text-muted-foreground">Loading department data...</p>
                    </div>
                  ) : overviewError ? (
                    <div className="h-[350px] flex items-center justify-center text-center" role="alert">
                      <p className="text-sm text-muted-foreground">{overviewError}</p>
                    </div>
                  ) : departmentBreakdown.length === 0 ? (
                    <div className="h-[350px] flex items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground">No approved reimbursements found for this month.</p>
                    </div>
                  ) : (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentBreakdown}>
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
                  )}
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
                {isOverviewLoading ? (
                  <div className="min-h-[88px] flex items-center justify-center" role="status" aria-live="polite">
                    <p className="text-sm text-muted-foreground">Loading recent activity...</p>
                  </div>
                ) : overviewError ? (
                  <div className="min-h-[88px] flex items-center justify-center text-center" role="alert">
                    <p className="text-sm text-muted-foreground">{overviewError}</p>
                  </div>
                ) : recentActivityRequests.length === 0 ? (
                  <div className="min-h-[88px] flex items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground">No reimbursement requests currently require attention.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivityRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="flex-1">
                          <h4 className="font-medium">{request.employeeName}</h4>
                          <p className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>
                            {getCategoryLabel(request.category)} • ₱{request.totalPrice.toLocaleString()} • {request.submittedDate}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-8 data-[state=active]:duration-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Reimbursement Requests</h2>
                <p className="text-muted-foreground">Review and manage employee submissions</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36 rounded-lg border-primary/15 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={requestFilterSelectItemClass}>All Types</SelectItem>
                    <SelectItem value="medicine" className={requestFilterSelectItemClass}>Medicine</SelectItem>
                    <SelectItem value="optical" className={requestFilterSelectItemClass}>Optical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36 rounded-lg border-primary/15 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={requestFilterSelectItemClass}>All Status</SelectItem>
                    <SelectItem value="pending" className={requestFilterSelectItemClass}>Pending</SelectItem>
                    <SelectItem value="approved" className={requestFilterSelectItemClass}>Approved</SelectItem>
                    <SelectItem value="denied" className={requestFilterSelectItemClass}>Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48 rounded-lg border-primary/15 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={requestFilterSelectItemClass}>All Departments</SelectItem>
                    <SelectItem value="Product Development" className={requestFilterSelectItemClass}>Product Development</SelectItem>
                    <SelectItem value="Finance" className={requestFilterSelectItemClass}>Finance</SelectItem>
                    <SelectItem value="HR" className={requestFilterSelectItemClass}>HR</SelectItem>
                    <SelectItem value="Admin" className={requestFilterSelectItemClass}>Admin</SelectItem>
                    <SelectItem value="IT Helpdesk" className={requestFilterSelectItemClass}>IT Helpdesk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-36 rounded-lg border-primary/15 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={requestFilterSelectItemClass}>All Years</SelectItem>
                    <SelectItem value="2024" className={requestFilterSelectItemClass}>2024</SelectItem>
                    <SelectItem value="2025" className={requestFilterSelectItemClass}>2025</SelectItem>
                    <SelectItem value="2026" className={requestFilterSelectItemClass}>2026</SelectItem>
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
                  {filterType !== "all" && `Type: ${filterType}`}
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
              {isOverviewLoading ? (
                <Card className="border-2 border-primary/10">
                  <CardContent className="p-12 text-center" role="status" aria-live="polite">
                    <p className="text-sm text-muted-foreground">Loading reimbursement requests...</p>
                  </CardContent>
                </Card>
              ) : overviewError ? (
                <Card className="border-2 border-primary/10">
                  <CardContent className="p-12 text-center" role="alert">
                    <p className="text-sm text-muted-foreground">{overviewError}</p>
                  </CardContent>
                </Card>
              ) : filteredRequests.length === 0 ? (
                <Card className="border-2 border-dashed border-primary/20">
                  <CardContent className="p-12 text-center">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters
                        ? "No reimbursement requests match your current filters."
                        : "No reimbursement requests have been submitted yet."}
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

                      {request.status === 'pending' && request.currentReviewStage === hrAdminReviewStage && (
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
                            onClick={() => void handleApprove(request)}
                            disabled={approvingRequestId === request.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {approvingRequestId === request.id ? "Approving..." : "Approve"}
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
                    Complete information for request {selectedRequest?.referenceNumber}
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
	                                onClick={() => void handlePreviewDocument(selectedRequest.prescription)}
	                                disabled={!selectedRequest.prescription.storagePath}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
	                              <Button
	                                variant="outline"
	                                size="sm"
	                                className="flex-1"
	                                onClick={() => void handleDownloadDocument(selectedRequest.prescription)}
	                                disabled={!selectedRequest.prescription.storagePath}
	                              >
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
	                                  onClick={() => void handlePreviewDocument({
	                                    id: receipt.id,
	                                    type: "receipt",
	                                    name: receipt.fileName,
	                                    fileName: receipt.fileName,
	                                    mimeType: receipt.mimeType,
	                                    storageBucket: receipt.storageBucket,
	                                    storagePath: receipt.storagePath,
	                                    index
	                                  })}
	                                  disabled={!receipt.storagePath}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </Button>
	                                <Button
	                                  variant="outline"
	                                  size="sm"
	                                  className="flex-1"
	                                  onClick={() => void handleDownloadDocument({
	                                    id: receipt.id,
	                                    type: "receipt",
	                                    name: receipt.fileName,
	                                    fileName: receipt.fileName,
	                                    mimeType: receipt.mimeType,
	                                    storageBucket: receipt.storageBucket,
	                                    storagePath: receipt.storagePath,
	                                    index
	                                  })}
	                                  disabled={!receipt.storagePath}
	                                >
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
                      {selectedRequest.status === 'pending' && selectedRequest.currentReviewStage === hrAdminReviewStage && (
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
                            onClick={() => void handleApprove(selectedRequest)}
                            disabled={approvingRequestId === selectedRequest.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {approvingRequestId === selectedRequest.id ? "Approving..." : "Approve Request"}
                          </Button>
                        </div>
                      )}
                    </div>

                      {/* Preview Column - Desktop (sm and above) */}
                      {previewDocument && (
                        <div className="hidden sm:block sm:border-l sm:pl-6">
                          {renderDocumentPreviewPanel(previewDocument)}

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
                          {renderDocumentPreviewPanel(previewDocument, true)}

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
                    Please select a reason for denying request {selectedRequest?.referenceNumber}
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
                  ) : !currentMonthlySummary ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No reimbursement activity found for this month.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="text-xl font-bold text-primary">₱{monthlySummaryMedicineReimbursed.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">Medicine</p>
                        </div>
                        <div className="p-4 bg-secondary/5 rounded-lg">
                          <div className="text-xl font-bold text-secondary">₱{monthlySummaryOpticalReimbursed.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">Optical</p>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg text-center border-t">
                        <div className="text-2xl font-bold">₱{monthlySummaryTotalReimbursed.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Reimbursed</p>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
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
                  {isOverviewLoading ? (
                    <div className="min-h-[132px] flex items-center justify-center" role="status" aria-live="polite">
                      <p className="text-sm text-muted-foreground">Loading department data...</p>
                    </div>
                  ) : overviewError ? (
                    <div className="min-h-[132px] flex items-center justify-center text-center" role="alert">
                      <p className="text-sm text-muted-foreground">{overviewError}</p>
                    </div>
                  ) : departmentBreakdown.length === 0 ? (
                    <div className="min-h-[132px] flex items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground">No approved reimbursements found for this month.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {departmentBreakdown.map((dept) => (
                        <div key={dept.department} className="space-y-1.5">
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-bold leading-tight">{dept.department}</span>
                            <span className="font-bold leading-tight text-right">{formatPesoAmount(dept.totalAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pl-4 text-sm text-gray-700">
                            <span>Medicine: {formatPesoAmount(dept.medicine)}</span>
                            <span className="text-right">Optical: {formatPesoAmount(dept.optical)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
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
                    <p className="font-medium">{adminProfile.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Employee ID</Label>
                    <p className="font-medium">{adminProfile.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Designation</Label>
                    <p className="font-medium">{adminProfile.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Department</Label>
                    <p className="font-medium">{adminProfile.department}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.72)' }}>Email Address</Label>
                    <p className="font-medium">{adminProfile.email}</p>
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
