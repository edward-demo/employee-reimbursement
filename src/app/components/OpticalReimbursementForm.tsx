import { useState } from "react";
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
  Glasses,
  X,
  Edit2
} from "lucide-react";

interface OpticalItem {
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

interface OpticalReimbursementFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

export function OpticalReimbursementForm({ onBack, onSubmit }: OpticalReimbursementFormProps) {
  const [opticalItems, setOpticalItems] = useState<OpticalItem[]>([
    { id: '1', name: '', quantity: '', unitPrice: '', subtotal: 0 }
  ]);

  const [notes, setNotes] = useState("");
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const addOpticalItem = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      unitPrice: '',
      subtotal: 0
    };
    setOpticalItems([...opticalItems, newMedicine]);
  };

  const removeOpticalItem = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(opticalItems.filter(med => med.id !== id));
    }
  };

  const updateOpticalItem = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(opticalItems.map(med => {
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
    return opticalItems.reduce((total, med) => total + med.subtotal, 0);
  };

  const handlePrescriptionUpload = (files: File[]) => {
    const combinedFiles = [...prescriptionFiles, ...files];
    if (combinedFiles.length <= 3) {
      setPrescriptionFiles(combinedFiles);
    } else {
      setPrescriptionFiles(combinedFiles.slice(0, 3));
    }
  };

  const removePrescriptionFile = (index: number) => {
    setPrescriptionFiles(prescriptionFiles.filter((_, i) => i !== index));
  };

  const handleReceiptUpload = (file: File) => {
    const newReceipt: ReceiptFile = {
      id: Date.now().toString() + Math.random(),
      file: file,
      invoiceNumber: '',
      isEditingInvoice: false
    };
    setReceipts([...receipts, newReceipt]);
  };

  const removeReceipt = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id));
  };

  const updateReceiptField = (id: string, field: keyof ReceiptFile, value: string | boolean) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isFormValid = () => {
    const medicinesValid = opticalItems.every(med => med.name && med.quantity && med.unitPrice);
    const documentsValid = prescriptionFiles.length > 0 && receipts.length > 0;
    const invoicesValid = receipts.every(r => r.invoiceNumber.trim() !== '');
    return medicinesValid && documentsValid && invoicesValid && isConfirmed;
  };

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
              <h1 className="text-xl font-bold text-primary">New Optical Reimbursement Request</h1>
              <p className="text-sm text-muted-foreground">Submit your optical reimbursement claim</p>
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
                Upload your doctor's prescription and official receipt (covers all optical items in this request)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground opacity-72">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground opacity-72">
                        PDF, PNG, JPG up to 10MB • {3 - prescriptionFiles.length} file{3 - prescriptionFiles.length !== 1 ? 's' : ''} remaining
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
                        onClick={() => document.getElementById('prescription-upload')?.click()}
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
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter invoice number"
                                  value={receipt.invoiceNumber}
                                  onChange={(e) => updateReceiptField(receipt.id, 'invoiceNumber', e.target.value)}
                                  className="border-primary/30 focus:border-primary placeholder:opacity-72"
                                />
                                {receipt.invoiceNumber && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateReceiptField(receipt.id, 'isEditingInvoice', false)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-2 bg-white rounded border border-green-300">
                                <span className="font-medium">{receipt.invoiceNumber}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateReceiptField(receipt.id, 'isEditingInvoice', true)}
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
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, PNG, JPG up to 10MB each • Multiple files allowed
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      id="receipt-upload"
                      multiple
                      onChange={(e) => {
                        const filesArray = Array.from(e.target.files || []);
                        filesArray.forEach(file => handleReceiptUpload(file));
                        e.target.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('receipt-upload')?.click()}
                    >
                      {receipts.length > 0 ? 'Add More Receipts' : 'Choose Files'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eye Care Details Section */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-primary" />
                    Eye Care Details
                  </CardTitle>
                  <CardDescription>
                    Add all optical items from your prescription or purchase
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  onClick={addOpticalItem}
                  variant="outline" 
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Optical Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Medicine List */}
              <div className="space-y-4">
                {opticalItems.map((medicine, index) => (
                  <Card key={medicine.id} className="border border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Glasses className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Item {index + 1}</h4>
                        </div>
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOpticalItem(medicine.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label className="opacity-72">Item Name *</Label>
                          <Input
                            placeholder="e.g., Eyeglasses, Contact Lenses"
                            value={medicine.name}
                            onChange={(e) => updateOpticalItem(medicine.id, 'name', e.target.value)}
                            className="border-primary/30 focus:border-primary placeholder:opacity-72"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="opacity-72">Quantity *</Label>
                          <Input
                            placeholder="e.g., 30"
                            type="number"
                            step="0.01"
                            value={medicine.quantity}
                            onChange={(e) => updateOpticalItem(medicine.id, 'quantity', e.target.value)}
                            className="border-primary/30 focus:border-primary placeholder:opacity-72"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="opacity-72">Unit Price (₱) *</Label>
                          <Input
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            value={medicine.unitPrice}
                            onChange={(e) => updateOpticalItem(medicine.id, 'unitPrice', e.target.value)}
                            className="border-primary/30 focus:border-primary placeholder:opacity-72"
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
                  placeholder="Any additional information about the optical items or prescription..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-primary/20 focus:border-primary placeholder:opacity-72"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Employee</Label>
                  <p className="font-medium">John Doe (EMP-2024-001)</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Department</Label>
                  <p className="font-medium">IT Department</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Request Date</Label>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Receipts</Label>
                  <p className="font-medium">{receipts.length} receipt{receipts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <Separator />

              {/* Documents Summary */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Documents Uploaded:</Label>
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

              <Separator />

              {/* Medicine Summary */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Optical Items Breakdown ({medicines.length} items):</Label>
                <div className="bg-white/50 rounded-lg p-3 space-y-2">
                  {opticalItems.map((medicine, index) => (
                    medicine.name && (
                      <div key={medicine.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{index + 1}. {medicine.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            (Qty: {medicine.quantity} × ₱{medicine.unitPrice})
                          </span>
                        </div>
                        <span className="font-medium text-right">₱{medicine.subtotal.toFixed(2)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

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
          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={onBack} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!isFormValid()}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}