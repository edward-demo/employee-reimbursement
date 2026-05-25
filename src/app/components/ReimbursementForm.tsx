import { useRef, useState, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import {
  ArrowLeft,
  Upload,
  FileText,
  Receipt,
  Calculator,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Pill,
  X,
  Edit2
} from "lucide-react";
import type { EmployeeDashboardData } from "./EmployeeDashboard";

interface Medicine {
  id: string;
  name: string;
  quantity: string;
  unitPrice: string;
  subtotal: number;
}

interface ReceiptFile {
  id: string;
  file: File;
  invoiceNumber: string;
  isEditingInvoice: boolean;
}

interface ReimbursementFormProps {
  onBack: () => void;
  onSubmit: (payload: {
    category: "medicine";
    items: Array<Pick<Medicine, "name" | "quantity" | "unitPrice" | "subtotal">>;
    prescriptionFiles: File[];
    receipts: Array<Pick<ReceiptFile, "file" | "invoiceNumber">>;
    notes: string;
  }) => Promise<void>;
  employeeProfile?: Pick<EmployeeDashboardData["employee"], "name" | "id" | "department">;
}

const MAX_UPLOAD_FILE_SIZE_BYTES = 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE_LABEL = "1MB";
const ACCEPTED_UPLOAD_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ACCEPTED_UPLOAD_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
type UploadPanel = "prescription" | "receipt";

export function ReimbursementForm({ onBack, onSubmit, employeeProfile }: ReimbursementFormProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: '', quantity: '', unitPrice: '', subtotal: 0 }
  ]);

  const [notes, setNotes] = useState("");
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOverPanel, setDragOverPanel] = useState<UploadPanel | null>(null);
  const invoiceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isSupportedUploadFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    return ACCEPTED_UPLOAD_MIME_TYPES.includes(file.type)
      || ACCEPTED_UPLOAD_EXTENSIONS.some(extension => fileName.endsWith(extension));
  };

  const getValidatedUploadFiles = (files: File[]) => {
    const unsupportedFiles = files.filter(file => !isSupportedUploadFile(file));
    const supportedFiles = files.filter(isSupportedUploadFile);
    const oversizedFiles = supportedFiles.filter(file => file.size > MAX_UPLOAD_FILE_SIZE_BYTES);
    const validFiles = supportedFiles.filter(file => file.size <= MAX_UPLOAD_FILE_SIZE_BYTES);
    const errorMessages = [];

    if (unsupportedFiles.length > 0) {
      errorMessages.push(`${unsupportedFiles.map(file => file.name).join(', ')} must be PDF, PNG, JPG, or JPEG files.`);
    }

    if (oversizedFiles.length > 0) {
      errorMessages.push(`${oversizedFiles.map(file => file.name).join(', ')} exceed${oversizedFiles.length === 1 ? 's' : ''} the ${MAX_UPLOAD_FILE_SIZE_LABEL} limit per file.`);
    }

    setUploadError(errorMessages.join(" "));
    return validFiles;
  };

  const hasSupportedDraggedFile = (event: DragEvent<HTMLDivElement>) => (
    Array.from(event.dataTransfer.items || []).some(item =>
      item.kind === "file"
      && (!item.type || ACCEPTED_UPLOAD_MIME_TYPES.includes(item.type))
    )
  );

  const handleUploadDragOver = (event: DragEvent<HTMLDivElement>, panel: UploadPanel) => {
    event.preventDefault();
    const hasSupportedFile = hasSupportedDraggedFile(event);
    event.dataTransfer.dropEffect = hasSupportedFile ? "copy" : "none";
    setDragOverPanel(hasSupportedFile ? panel : null);
  };

  const handleUploadDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragOverPanel(null);
    }
  };

  const handleUploadDrop = (
    event: DragEvent<HTMLDivElement>,
    uploadHandler: (files: File[]) => void
  ) => {
    event.preventDefault();
    setDragOverPanel(null);
    uploadHandler(Array.from(event.dataTransfer.files || []));
  };

  const handleUploadPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>, inputId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.getElementById(inputId)?.click();
    }
  };

  const addMedicine = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      unitPrice: '',
      subtotal: 0
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(med => med.id !== id));
    }
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(med => {
      if (med.id === id) {
        const updated = { ...med, [field]: value };
        
        // Calculate subtotal if quantity or unitPrice changed
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
          const price = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0;
          updated.subtotal = qty * price;
        }
        
        return updated;
      }
      return med;
    }));
  };

  const getTotalAmount = () => {
    return medicines.reduce((total, med) => total + med.subtotal, 0);
  };

  const handlePrescriptionUpload = (files: File[]) => {
    const validFiles = getValidatedUploadFiles(files);

    const combinedFiles = [...prescriptionFiles, ...validFiles];
    if (combinedFiles.length <= 3) {
      setPrescriptionFiles(combinedFiles);
    } else {
      setPrescriptionFiles(combinedFiles.slice(0, 3));
    }
  };

  const removePrescriptionFile = (index: number) => {
    setPrescriptionFiles(prescriptionFiles.filter((_, i) => i !== index));
  };

  const handleReceiptUpload = (files: File[]) => {
    const validFiles = getValidatedUploadFiles(files);

    const newReceipts = validFiles.map((file) => ({
      id: Date.now().toString() + Math.random(),
      file,
      invoiceNumber: '',
      isEditingInvoice: true
    }));
    setReceipts([...receipts, ...newReceipts]);
  };

  const removeReceipt = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id));
  };

  const updateReceiptField = (id: string, field: keyof ReceiptFile, value: string | boolean) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleReceiptInvoiceBlur = (receipt: ReceiptFile) => {
    if (receipt.invoiceNumber.trim()) {
      updateReceiptField(receipt.id, 'isEditingInvoice', false);
    }
  };

  const handleReceiptInvoiceEdit = (receiptId: string) => {
    updateReceiptField(receiptId, 'isEditingInvoice', true);
    window.requestAnimationFrame(() => {
      invoiceInputRefs.current[receiptId]?.focus();
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid() || !hasEmployeeSummaryData || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await onSubmit({
        category: "medicine",
        items: medicines.map(({ name, quantity, unitPrice, subtotal }) => ({
          name,
          quantity,
          unitPrice,
          subtotal
        })),
        prescriptionFiles,
        receipts: receipts.map(({ file, invoiceNumber }) => ({ file, invoiceNumber })),
        notes
      });
    } catch (error) {
      console.error("Failed to submit medicine reimbursement request", error);
      setSubmitError("Unable to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const medicinesValid = medicines.every(med =>
      med.name.trim()
      && Number(med.quantity) > 0
      && Number(med.unitPrice) > 0
      && med.subtotal > 0
    );
    const documentsValid = prescriptionFiles.length > 0 && receipts.length > 0;
    const invoiceNumbers = receipts.map(r => r.invoiceNumber.trim()).filter(Boolean);
    const invoicesValid = receipts.every(r => r.invoiceNumber.trim() !== '')
      && new Set(invoiceNumbers).size === invoiceNumbers.length;
    return medicinesValid && documentsValid && invoicesValid && getTotalAmount() > 0 && isConfirmed;
  };

  const employeeName = employeeProfile?.name?.trim();
  const employeeNumber = employeeProfile?.id?.trim();
  const employeeDepartment = employeeProfile?.department?.trim();
  const hasEmployeeSummaryData = Boolean(employeeName && employeeDepartment);
  const employeeDisplay = employeeNumber ? `${employeeName} (${employeeNumber})` : employeeName;
  const canSubmit = isFormValid() && hasEmployeeSummaryData && !isSubmitting;
  const enteredMedicines = medicines.filter((medicine) => medicine.name.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button onClick={onBack} variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">New Reimbursement Request</h1>
              <p className="text-sm text-muted-foreground">Submit your medicine reimbursement claim</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" />
                Required Documents
              </CardTitle>
              <CardDescription>
                Upload your doctor's prescription and official receipt (covers all medicines in this request)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {uploadError && (
                <div className="flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{uploadError}</p>
                </div>
              )}

              {/* Prescription Upload */}
              <div className="space-y-2">
                <Label className="flex items-center opacity-72">
                  <FileText className="h-4 w-4 mr-2" />
                  Doctor's Prescription * (Up to 3 files)
                </Label>

                {/* Uploaded Prescription Files */}
                {prescriptionFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {prescriptionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Prescription {index + 1}: {file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescriptionFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {prescriptionFiles.length < 3 && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      dragOverPanel === "prescription"
                        ? "border-primary/60 bg-primary/5"
                        : "border-primary/20 hover:border-primary/40"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => document.getElementById('prescription-upload')?.click()}
                    onKeyDown={(event) => handleUploadPanelKeyDown(event, 'prescription-upload')}
                    onDragOver={(event) => handleUploadDragOver(event, "prescription")}
                    onDragLeave={handleUploadDragLeave}
                    onDrop={(event) => handleUploadDrop(event, handlePrescriptionUpload)}
                  >
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-600">
                        PDF, PNG, JPG up to {MAX_UPLOAD_FILE_SIZE_LABEL} each • {3 - prescriptionFiles.length} file{3 - prescriptionFiles.length !== 1 ? 's' : ''} remaining
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        id="prescription-upload"
                        multiple
                        onChange={(e) => {
                          const filesArray = Array.from(e.target.files || []);
                          handlePrescriptionUpload(filesArray);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-400"
                        onClick={(event) => {
                          event.stopPropagation();
                          document.getElementById('prescription-upload')?.click();
                        }}
                      >
                        {prescriptionFiles.length > 0 ? 'Add More Prescriptions' : 'Choose Files'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="space-y-3">
                <Label className="flex items-center opacity-72">
                  <Receipt className="h-4 w-4 mr-2" />
                  Official Receipts * (You can upload multiple receipts)
                </Label>

                {/* Uploaded Receipts List */}
                {receipts.length > 0 && (
                  <div className="space-y-3 mb-3">
                    {receipts.map((receipt, index) => (
                      <Card key={receipt.id} className="border-2 border-green-200 bg-green-50/50">
                        <CardContent className="p-4 space-y-3">
                          {/* File Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Receipt {index + 1}: {receipt.file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeReceipt(receipt.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Invoice Number */}
                          <div className="space-y-2">
                            <Label className="text-sm opacity-72">Invoice/Receipt Number *</Label>
                            {receipt.isEditingInvoice || !receipt.invoiceNumber ? (
                              <Input
                                ref={(input) => {
                                  invoiceInputRefs.current[receipt.id] = input;
                                }}
                                placeholder="Enter invoice number"
                                value={receipt.invoiceNumber}
                                onChange={(e) => updateReceiptField(receipt.id, 'invoiceNumber', e.target.value)}
                                onBlur={() => handleReceiptInvoiceBlur(receipt)}
                                className="border-primary/30 bg-white focus:border-primary placeholder:opacity-72"
                              />
                            ) : (
                              <div className="flex items-center justify-between p-2 bg-white rounded border border-green-300">
                                <span className="font-medium">{receipt.invoiceNumber}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReceiptInvoiceEdit(receipt.id)}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragOverPanel === "receipt"
                      ? "border-primary/60 bg-primary/5"
                      : "border-primary/20 hover:border-primary/40"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  onKeyDown={(event) => handleUploadPanelKeyDown(event, 'receipt-upload')}
                  onDragOver={(event) => handleUploadDragOver(event, "receipt")}
                  onDragLeave={handleUploadDragLeave}
                  onDrop={(event) => handleUploadDrop(event, handleReceiptUpload)}
                >
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-600">
                      PDF, PNG, JPG up to {MAX_UPLOAD_FILE_SIZE_LABEL} each • Multiple files allowed
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      id="receipt-upload"
                      multiple
                      onChange={(e) => {
                        const filesArray = Array.from(e.target.files || []);
                        handleReceiptUpload(filesArray);
                        e.target.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gray-400"
                      onClick={(event) => {
                        event.stopPropagation();
                        document.getElementById('receipt-upload')?.click();
                      }}
                    >
                      {receipts.length > 0 ? 'Add More Receipts' : 'Choose Files'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicine Details Section */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-primary" />
                    Medicine Details
                  </CardTitle>
                  <CardDescription>
                    Add all medicines from your prescription or purchase
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  onClick={addMedicine}
                  variant="outline" 
                  size="sm"
                  className="rounded-full border-gray-400 bg-white px-4 font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Plus className="h-4 w-4 mr-2 text-gray-600" />
                  Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Medicine List */}
              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <Card key={medicine.id} className="border border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Pill className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Medicine {index + 1}</h4>
                        </div>
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedicine(medicine.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label className="opacity-72">Medicine Name *</Label>
                          <Input
                            placeholder="e.g., Paracetamol 500mg"
                            value={medicine.name}
                            onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                            className="border-primary/30 bg-white focus:border-primary placeholder:opacity-72"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="opacity-72">Quantity *</Label>
                          <Input
                            placeholder="e.g., 30"
                            type="number"
                            step="0.01"
                            value={medicine.quantity}
                            onChange={(e) => updateMedicine(medicine.id, 'quantity', e.target.value)}
                            className="border-primary/30 bg-white focus:border-primary placeholder:opacity-72"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="opacity-72">Unit Price (₱) *</Label>
                          <Input
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            value={medicine.unitPrice}
                            onChange={(e) => updateMedicine(medicine.id, 'unitPrice', e.target.value)}
                            className="border-primary/30 bg-white focus:border-primary placeholder:opacity-72"
                          />
                        </div>
                      </div>
                      
                      {/* Subtotal Display */}
                      <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Subtotal:</span>
                          <span className="font-semibold text-secondary">₱{medicine.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="opacity-72">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the medicines or prescription..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-primary/20 bg-white focus:border-primary placeholder:opacity-72"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card className="border-2 border-secondary/20 bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-secondary">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasEmployeeSummaryData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-normal text-gray-500">Employee</Label>
                    <p className="font-medium">{employeeDisplay}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-normal text-gray-500">Department</Label>
                    <p className="font-medium">{employeeDepartment}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-normal text-gray-500">Request Date</Label>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-normal text-gray-500">Total Receipts</Label>
                    <p className="font-medium">{receipts.length} receipt{receipts.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to retrieve data. Please refresh the page.</p>
              )}

              <Separator />

              {/* Documents Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-normal text-gray-500">Documents Uploaded:</Label>
                <div className="bg-white/50 rounded-lg p-3 space-y-2 text-sm">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Prescriptions ({prescriptionFiles.length}):</span>
                    </div>
                    {prescriptionFiles.map((file, index) => (
                      <div key={index} className="ml-6 text-xs text-muted-foreground">
                        {index + 1}. {file.name}
                      </div>
                    ))}
                    {prescriptionFiles.length === 0 && (
                      <div className="ml-6 text-xs text-muted-foreground">Not uploaded</div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Receipt className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Receipts ({receipts.length}):</span>
                    </div>
                    {receipts.map((receipt, index) => (
                      <div key={receipt.id} className="ml-6 text-xs text-muted-foreground">
                        {index + 1}. {receipt.invoiceNumber || 'No invoice number'} - {receipt.file.name}
                      </div>
                    ))}
                    {receipts.length === 0 && (
                      <div className="ml-6 text-xs text-muted-foreground">Not uploaded</div>
                    )}
                  </div>
                </div>
              </div>

              {enteredMedicines.length > 0 && (
                <>
                  <Separator />

                  {/* Medicine Summary */}
                  <div className="space-y-2">
                    <Label className="text-sm font-normal text-gray-500">Medicines Breakdown ({enteredMedicines.length} items):</Label>
                    <div className="bg-white/50 rounded-lg p-3 space-y-2">
                      {enteredMedicines.map((medicine, index) => (
                        <div key={medicine.id} className="flex justify-between items-center text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{index + 1}. {medicine.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              (Qty: {medicine.quantity} × ₱{medicine.unitPrice})
                            </span>
                          </div>
                          <span className="font-medium text-right">₱{medicine.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Total Amount Calculation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-medium">Total Reimbursement Amount:</span>
                  <span className="text-3xl font-bold text-secondary">₱{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Please ensure all uploaded documents are clear and legible, and all invoice numbers are correctly entered.
                  Your request will be reviewed by the HR/Finance team within 3-5 business days.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Checkbox */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirm-checkbox"
                  checked={isConfirmed}
                  onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="confirm-checkbox"
                  className="text-sm font-medium cursor-pointer leading-relaxed"
                >
                  I confirm that the submitted information is true and correct to the best of my knowledge.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}
          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
