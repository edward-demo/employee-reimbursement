import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Palette, 
  Component, 
  Layers,
  CheckCircle,
  Users,
  Receipt,
  DollarSign,
  Clock,
  Pill,
  FileText,
  Copy,
  Code
} from "lucide-react";

// Import our custom components
import { StatusBadge } from "./library/StatusBadge";
import { StatsCard } from "./library/StatsCard";
import { BrandHeader } from "./library/BrandHeader";
import { FileUploadArea } from "./library/FileUploadArea";
import { MedicineCard } from "./library/MedicineCard";
import { RequestCard } from "./library/RequestCard";
import { EmployeeCard } from "./library/EmployeeCard";

interface ComponentLibraryProps {
  onBack: () => void;
}

export function ComponentLibrary({ onBack }: ComponentLibraryProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleMedicine, setSampleMedicine] = useState({
    id: '1',
    name: 'Paracetamol 500mg',
    quantity: '30',
    unitPrice: '15.00',
    subtotal: 450.00
  });

  const handleMedicineUpdate = (id: string, field: string, value: string) => {
    setSampleMedicine(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
        const price = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0;
        updated.subtotal = qty * price;
      }
      return updated;
    });
  };

  const colorPalette = [
    { name: 'Primary', value: '#6E0F86', description: 'Main brand color for primary actions' },
    { name: 'Secondary', value: '#F165E3', description: 'Accent color for highlights and secondary actions' },
    { name: 'Muted', value: '#E1B3CE', description: 'Subtle accent for backgrounds and borders' },
    { name: 'Background', value: '#FFFFFF', description: 'Main background color' },
  ];

  const componentCategories = [
    {
      name: 'Status Components',
      components: [
        { name: 'StatusBadge', description: 'Displays request status with icons and colors' },
      ]
    },
    {
      name: 'Data Display',
      components: [
        { name: 'StatsCard', description: 'Statistics cards with metrics and trends' },
        { name: 'RequestCard', description: 'Reimbursement request display cards' },
        { name: 'EmployeeCard', description: 'Employee information cards' },
      ]
    },
    {
      name: 'Form Components',
      components: [
        { name: 'FileUploadArea', description: 'Drag & drop file upload with validation' },
        { name: 'MedicineCard', description: 'Individual medicine entry forms' },
      ]
    },
    {
      name: 'Layout Components',
      components: [
        { name: 'BrandHeader', description: 'Consistent headers with branding and navigation' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button onClick={onBack} variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mockups
            </Button>
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2 rounded-lg">
                <Component className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Component Library</h1>
                <p className="text-sm text-muted-foreground">MedReimburse Design System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Colors
            </TabsTrigger>
            <TabsTrigger value="components" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Components
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-primary">MedReimburse Design System</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                A comprehensive component library for the medicine reimbursement HRIS system. 
                Built with consistency, accessibility, and brand identity in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-primary" />
                    Brand Colors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">4</div>
                  <p className="text-sm text-muted-foreground">Consistent color palette</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Component className="h-5 w-5 mr-2 text-secondary" />
                    Components
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">7</div>
                  <p className="text-sm text-muted-foreground">Reusable components</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Variants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">15+</div>
                  <p className="text-sm text-muted-foreground">Component variations</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Code className="h-5 w-5 mr-2 text-yellow-600" />
                    TypeScript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">100%</div>
                  <p className="text-sm text-muted-foreground">Type safety</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-secondary/20 bg-secondary/5">
              <CardHeader>
                <CardTitle className="text-secondary">Component Categories</CardTitle>
                <CardDescription>
                  Organized by functionality and use case
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {componentCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-primary">{category.name}</h4>
                      <ul className="space-y-1">
                        {category.components.map((component, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="font-medium">{component.name}</span>
                            <span className="text-muted-foreground"> - {component.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Brand Color Palette</h2>
              <p className="text-muted-foreground">Core colors that define the MedReimburse brand identity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {colorPalette.map((color, index) => (
                <Card key={index} className="border-2 border-primary/10">
                  <CardContent className="p-6">
                    <div 
                      className="w-full h-24 rounded-lg mb-4 border border-gray-200"
                      style={{ backgroundColor: color.value }}
                    ></div>
                    <h3 className="font-semibold">{color.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{color.description}</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{color.value}</code>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Color Usage Guidelines</CardTitle>
                <CardDescription>Best practices for using brand colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Primary (#6E0F86)</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Main navigation and headers</li>
                      <li>• Primary action buttons</li>
                      <li>• Important text and titles</li>
                      <li>• Focus states and selections</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">Secondary (#F165E3)</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Accent elements and highlights</li>
                      <li>• Secondary action buttons</li>
                      <li>• Interactive elements</li>
                      <li>• Progress indicators</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: '#E1B3CE' }}>Muted (#E1B3CE)</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Background tints</li>
                      <li>• Subtle borders</li>
                      <li>• Disabled states</li>
                      <li>• Placeholder text</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Component Documentation</h2>
              <p className="text-muted-foreground">Interactive examples of all available components</p>
            </div>

            {/* Status Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Status Badge</CardTitle>
                <CardDescription>Display request statuses with consistent styling and icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <StatusBadge status="approved" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="denied" />
                  <StatusBadge status="under-review" />
                  <StatusBadge status="processing" />
                </div>
                <Separator />
                <div className="bg-muted/20 p-4 rounded-lg">
                  <code className="text-sm">
                    {`<StatusBadge status="approved" />`}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Stats Card</CardTitle>
                <CardDescription>Display key metrics with consistent formatting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Requests"
                    value="24"
                    description="This month"
                    icon={FileText}
                    borderColor="primary"
                  />
                  <StatsCard
                    title="Total Amount"
                    value="₱45,230"
                    description="Reimbursed"
                    icon={DollarSign}
                    borderColor="green"
                    trend={{ value: "12% from last month", isPositive: true }}
                  />
                  <StatsCard
                    title="Pending Review"
                    value="5"
                    description="Awaiting approval"
                    icon={Clock}
                    borderColor="yellow"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>File Upload Area</CardTitle>
                <CardDescription>Drag and drop file upload with validation and preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploadArea
                  label="Sample Upload"
                  description="Drag and drop or click to upload"
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  icon="document"
                />
              </CardContent>
            </Card>

            {/* Medicine Card */}
            <Card>
              <CardHeader>
                <CardTitle>Medicine Card</CardTitle>
                <CardDescription>Individual medicine entry with automatic calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MedicineCard
                  medicine={sampleMedicine}
                  index={0}
                  canRemove={false}
                  onUpdate={handleMedicineUpdate}
                  onRemove={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Usage Examples</h2>
              <p className="text-muted-foreground">Real-world examples of components in context</p>
            </div>

            {/* Request Card Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Request Cards</CardTitle>
                <CardDescription>Different variants for employee and admin views</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Employee View</h4>
                  <RequestCard
                    request={{
                      id: "REQ-001",
                      medicineName: "Paracetamol 500mg",
                      quantity: "30 tablets",
                      totalPrice: 450.00,
                      submittedDate: "2024-01-15",
                      status: "approved",
                      remarks: "Approved by HR. Payment processed."
                    }}
                    variant="employee"
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-4">Admin View</h4>
                  <RequestCard
                    request={{
                      id: "REQ-002",
                      employeeName: "John Doe",
                      employeeId: "EMP-2024-001",
                      department: "IT Department",
                      medicineName: "Vitamin D3 Supplements",
                      quantity: "60 capsules",
                      totalPrice: 1200.00,
                      submittedDate: "2024-01-10",
                      status: "pending",
                      remarks: "Under review by finance team."
                    }}
                    variant="admin"
                    showDocuments={true}
                    onApprove={(id) => console.log('Approve:', id)}
                    onDeny={(id) => console.log('Deny:', id)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Employee Card Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Cards</CardTitle>
                <CardDescription>List and card variants for employee management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">List Variant</h4>
                  <EmployeeCard
                    employee={{
                      id: "EMP-2024-001",
                      name: "John Doe",
                      department: "IT Department",
                      email: "john.doe@company.com",
                      status: "active",
                      role: "Software Engineer"
                    }}
                    variant="list"
                    onEdit={(id) => console.log('Edit:', id)}
                    onResetPassword={(id) => console.log('Reset:', id)}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-4">Card Variant</h4>
                  <div className="max-w-sm">
                    <EmployeeCard
                      employee={{
                        id: "EMP-2024-002",
                        name: "Sarah Johnson",
                        department: "Marketing",
                        email: "sarah.johnson@company.com",
                        status: "active",
                        role: "Marketing Manager",
                        joinDate: "Jan 2024"
                      }}
                      variant="card"
                      onEdit={(id) => console.log('Edit:', id)}
                      onResetPassword={(id) => console.log('Reset:', id)}
                      onToggleStatus={(id) => console.log('Toggle:', id)}
                    />
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