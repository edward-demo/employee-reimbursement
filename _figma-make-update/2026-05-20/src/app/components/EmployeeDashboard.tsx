import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  User,
  LogOut,
  Receipt,
  Calendar,
  Pill,
  Glasses,
  ArrowRight
} from "lucide-react";

interface EmployeeDashboardProps {
  onLogout: () => void;
  onNewRequest: () => void;
  onNewOpticalRequest: () => void;
}

export function EmployeeDashboard({ onLogout, onNewRequest, onNewOpticalRequest }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isViewMedicinesOpen, setIsViewMedicinesOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Mock data
  const employee = {
    name: "Jose Rizal",
    id: "EMP-2024-001",
    profilePicture: null,
    designation: "Software Engineer",
    department: "Product Development",
    email: "jose.rizal@company.com",
    medicineLimit: 10000.00, // Annual medicine reimbursement limit
    opticalLimit: 5000.00 // Annual optical reimbursement limit
  };

  const reimbursementRequests = [
    {
      id: "REQ-001",
      medicines: [
        { name: "Paracetamol 500mg", quantity: "30 tablets", unitPrice: "15.00", subtotal: 450.00 }
      ],
      totalPrice: 450.00,
      submittedDate: "2024-01-15",
      status: "approved",
      category: "medicine",
      lineManagerApproved: true,
      prescriptions: [{ name: "prescription-001.pdf" }],
      receipts: [{ fileName: "receipt-001.pdf", invoiceNumber: "INV-2024-0001" }],
      remarks: "Approved by HR. Payment processed."
    },
    {
      id: "REQ-002",
      medicines: [
        { name: "Cholecalciferol 1000 IU", quantity: "60 capsules", unitPrice: "20.00", subtotal: 1200.00 }
      ],
      totalPrice: 1200.00,
      submittedDate: "2024-01-10",
      status: "pending",
      category: "medicine",
      lineManagerApproved: true,
      prescriptions: [{ name: "prescription-002.pdf" }],
      receipts: [{ fileName: "receipt-002.pdf", invoiceNumber: "INV-2024-0002" }],
      remarks: "Under review by finance team."
    },
    {
      id: "REQ-003",
      medicines: [
        { name: "Amoxicillin 500mg", quantity: "21 tablets", unitPrice: "30.00", subtotal: 630.00 },
        { name: "Ascorbic Acid 500mg", quantity: "30 tablets", unitPrice: "7.33", subtotal: 220.00 }
      ],
      totalPrice: 850.00,
      submittedDate: "2024-01-05",
      status: "denied",
      category: "medicine",
      lineManagerApproved: true,
      prescriptions: [{ name: "prescription-003-a.pdf" }, { name: "prescription-003-b.pdf" }],
      receipts: [
        { fileName: "receipt-003-a.pdf", invoiceNumber: "INV-2024-0003" },
        { fileName: "receipt-003-b.pdf", invoiceNumber: "INV-2024-0004" }
      ],
      remarks: "Prescription date exceeds allowed timeframe."
    },
    {
      id: "REQ-004",
      medicines: [
        { name: "Prescription Eyeglasses", quantity: "1 pair", unitPrice: "2500.00", subtotal: 2500.00 }
      ],
      totalPrice: 2500.00,
      submittedDate: "2024-01-08",
      status: "approved",
      category: "optical",
      lineManagerApproved: true,
      prescriptions: [{ name: "prescription-004.pdf" }],
      receipts: [{ fileName: "receipt-004.pdf", invoiceNumber: "INV-2024-0004" }],
      remarks: "Approved by HR. Payment processed."
    }
  ];

  // Calculate totals by category
  const medicineApprovedAmount = reimbursementRequests
    .filter(req => req.status === 'approved' && req.category === 'medicine')
    .reduce((sum, req) => sum + req.totalPrice, 0);

  const opticalApprovedAmount = reimbursementRequests
    .filter(req => req.status === 'approved' && req.category === 'optical')
    .reduce((sum, req) => sum + req.totalPrice, 0);

  const medicineRemainingBalance = employee.medicineLimit - medicineApprovedAmount;
  const opticalRemainingBalance = employee.opticalLimit - opticalApprovedAmount;

  const pendingRequests = reimbursementRequests.filter(req => req.status === 'pending');
  const oldestPendingRequest = pendingRequests.length > 0
    ? pendingRequests.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime())[0]
    : null;

  const handleCategorySelect = (category: 'medicine' | 'optical') => {
    setIsCategoryModalOpen(false);
    if (category === 'medicine') {
      onNewRequest();
    } else {
      onNewOpticalRequest();
    }
  };

  const getMedicineDisplayName = (medicines: any[]) => {
    if (medicines.length === 0) return "";
    if (medicines.length === 1) return medicines[0].name;
    return `${medicines[0].name} +${medicines.length - 1} more`;
  };

  const getUploadSummary = (prescriptions: any[], receipts: any[]) => {
    const prescriptionText = `${prescriptions.length} Prescription${prescriptions.length !== 1 ? 's' : ''}`;
    const receiptText = `${receipts.length} Receipt${receipts.length !== 1 ? 's' : ''}`;
    return `${prescriptionText} • ${receiptText}`;
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

    if (status === 'denied') {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2 rounded-lg">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">MedReimburse</h1>
                <p className="text-sm text-muted-foreground">Employee Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.designation}</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profile
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Requests
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Benefits Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Medicine Balance */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Medicine</p>
                      </div>
                      <div className="text-3xl font-bold text-primary mb-1">₱{medicineRemainingBalance.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">₱{medicineApprovedAmount.toFixed(2)} used of ₱{employee.medicineLimit.toLocaleString()}</p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(medicineApprovedAmount / employee.medicineLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      {/* Optical Balance */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Optical</p>
                      </div>
                      <div className="text-2xl font-bold text-secondary mb-1">₱{opticalRemainingBalance.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">₱{opticalApprovedAmount.toFixed(2)} used of ₱{employee.opticalLimit.toLocaleString()}</p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all"
                          style={{ width: `${(opticalApprovedAmount / employee.opticalLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-600 mb-2">{pendingRequests.length}</div>
                  <p className="text-sm text-muted-foreground mb-4">Awaiting HR approval</p>
                  {oldestPendingRequest && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground">Oldest request</p>
                      <p className="text-sm font-medium">{oldestPendingRequest.submittedDate}</p>
                    </div>
                  )}
                  {pendingRequests.length === 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">No pending requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Submit a new reimbursement request</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={() => setIsCategoryModalOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Reimbursement Request
                </Button>
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Your latest reimbursement submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reimbursementRequests.slice(0, 2).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{getMedicineDisplayName(request.medicines)}</h4>
                          {getStatusBadge(request.status, request.lineManagerApproved)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₱{request.totalPrice} • {request.submittedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Employee ID</Label>
                    <p className="font-medium">{employee.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Designation</Label>
                    <p className="font-medium">{employee.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Department</Label>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-muted-foreground">Email Address</Label>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Reimbursement Requests</h2>
                <p className="text-muted-foreground">Track all your medicine reimbursement submissions</p>
              </div>
              <Button onClick={() => setIsCategoryModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            <div className="space-y-4">
              {reimbursementRequests.map((request) => (
                <Card key={request.id} className="">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${request.category === 'medicine' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          {request.category === 'medicine' ? (
                            <Pill className="h-5 w-5 text-purple-600" />
                          ) : (
                            <Glasses className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{getMedicineDisplayName(request.medicines)}</h3>
                            {request.medicines.length >= 2 && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-primary"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsViewMedicinesOpen(true);
                                }}
                              >
                                View More
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Request ID: {request.id} • Invoice No: {request.receipts[0].invoiceNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getUploadSummary(request.prescriptions, request.receipts)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(request.status, request.lineManagerApproved)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                        <p className="font-semibold">₱{request.totalPrice}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
                        <p>{request.submittedDate}</p>
                      </div>
                    </div>
                    
                    {request.remarks && (
                      <div className="bg-muted/20 p-3 rounded-md">
                        <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                        <p className="text-sm">{request.remarks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Category Selection Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Reimbursement Request</DialogTitle>
            <DialogDescription>
              Select the type of reimbursement you want to file
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Medicine Card */}
            <Card
              className="hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleCategorySelect('medicine')}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Pill className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Medicine</h3>
                    <p className="text-sm text-muted-foreground">
                      For prescriptions, pharmacy purchases, and medical supplies
                    </p>
                  </div>
                  <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optical Card */}
            <Card
              className="border-2 border-secondary/20 hover:border-secondary hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleCategorySelect('optical')}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-secondary/10 p-4 rounded-full group-hover:bg-secondary/20 transition-colors">
                    <Glasses className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Optical</h3>
                    <p className="text-sm text-muted-foreground">
                      For eyeglasses, contact lenses, and optical services
                    </p>
                  </div>
                  <div className="flex items-center text-secondary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Medicines Modal */}
      <Dialog open={isViewMedicinesOpen} onOpenChange={setIsViewMedicinesOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medicine Details</DialogTitle>
            <DialogDescription>
              All items in request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              {selectedRequest.medicines.map((medicine: any, index: number) => (
                <Card key={index} className="">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-3">{medicine.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{medicine.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Unit Price:</span>
                        <span className="font-medium">₱{medicine.unitPrice}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-semibold">Total:</span>
                        <span className="font-bold text-lg">₱{medicine.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">₱{selectedRequest.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsViewMedicinesOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}