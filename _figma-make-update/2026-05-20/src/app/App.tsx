import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { LineManagerDashboard } from "./components/LineManagerDashboard";
import { ReimbursementForm } from "./components/ReimbursementForm";
import { OpticalReimbursementForm } from "./components/OpticalReimbursementForm";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import {
  Eye,
  User,
  UserCog,
  FileText,
  LogIn,
  ArrowLeft,
  Layout,
  Pill,
  Component,
  Users
} from "lucide-react";

type UserRole = 'employee' | 'admin' | 'line-manager' | null;
type Screen = 'login' | 'employee-dashboard' | 'admin-dashboard' | 'line-manager-dashboard' | 'reimbursement-form' | 'optical-reimbursement-form' | 'mockup-viewer' | 'component-library';

interface MockupItem {
  id: string;
  title: string;
  description: string;
  screen: Screen;
  icon: React.ReactNode;
  category: 'Auth' | 'Employee' | 'Admin' | 'Forms' | 'Design';
  role?: UserRole;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('mockup-viewer');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const mockups: MockupItem[] = [
    {
      id: 'login',
      title: 'Login Screen',
      description: 'Brand-styled login with demo access for both employee and admin roles',
      screen: 'login',
      icon: <LogIn className="h-5 w-5" />,
      category: 'Auth'
    },
    {
      id: 'employee-dashboard',
      title: 'Employee Dashboard',
      description: 'Overview, profile management, and request tracking with tabbed navigation',
      screen: 'employee-dashboard',
      icon: <User className="h-5 w-5" />,
      category: 'Employee',
      role: 'employee'
    },
    {
      id: 'reimbursement-form',
      title: 'Reimbursement Form',
      description: 'Multi-medicine submission form with file uploads and automatic calculations',
      screen: 'reimbursement-form',
      icon: <FileText className="h-5 w-5" />,
      category: 'Forms',
      role: 'employee'
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      description: 'Complete management portal with request review, employee management, and reports',
      screen: 'admin-dashboard',
      icon: <UserCog className="h-5 w-5" />,
      category: 'Admin',
      role: 'admin'
    },
    {
      id: 'line-manager-dashboard',
      title: 'Line Manager Dashboard',
      description: 'Fast approval interface for team reimbursement requests with inline actions',
      screen: 'line-manager-dashboard',
      icon: <Users className="h-5 w-5" />,
      category: 'Admin',
      role: 'line-manager'
    },
    {
      id: 'component-library',
      title: 'Component Library',
      description: 'Complete design system with reusable components, colors, and usage guidelines',
      screen: 'component-library',
      icon: <Component className="h-5 w-5" />,
      category: 'Design'
    }
  ];

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role === 'employee') {
      setCurrentScreen('employee-dashboard');
      toast.success("Welcome back! You've successfully logged in.", {
        description: "Access your reimbursement requests and submit new claims."
      });
    } else if (role === 'admin') {
      setCurrentScreen('admin-dashboard');
      toast.success("Admin access granted", {
        description: "You can now review and manage employee requests."
      });
    } else if (role === 'line-manager') {
      setCurrentScreen('line-manager-dashboard');
      toast.success("Line Manager access granted", {
        description: "Review and approve team reimbursement requests."
      });
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentScreen('mockup-viewer');
    toast.info("Returned to mockup viewer");
  };

  const handleNewRequest = () => {
    setCurrentScreen('reimbursement-form');
  };

  const handleNewOpticalRequest = () => {
    setCurrentScreen('optical-reimbursement-form');
  };

  const handleBackToDashboard = () => {
    if (userRole === 'employee') {
      setCurrentScreen('employee-dashboard');
    } else if (userRole === 'admin') {
      setCurrentScreen('admin-dashboard');
    } else if (userRole === 'line-manager') {
      setCurrentScreen('line-manager-dashboard');
    } else {
      setCurrentScreen('mockup-viewer');
    }
  };

  const handleSubmitRequest = () => {
    toast.success("Reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    setCurrentScreen('employee-dashboard');
  };

  const handleSubmitOpticalRequest = () => {
    toast.success("Optical reimbursement request submitted!", {
      description: "Your request has been sent for review. You'll be notified once it's processed."
    });
    setCurrentScreen('employee-dashboard');
  };

  const handleViewMockup = (mockup: MockupItem) => {
    if (mockup.role) {
      setUserRole(mockup.role);
    }
    setCurrentScreen(mockup.screen);
    toast.info(`Viewing ${mockup.title}`, {
      description: "This is a mockup demonstration"
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Auth': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee': return 'bg-green-100 text-green-800 border-green-200';
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Forms': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Design': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mockup Viewer Screen
  if (currentScreen === 'mockup-viewer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <header className="bg-white border-b-2 border-primary/10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Pill className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">MedReimburse System</h1>
                  <p className="text-sm text-muted-foreground">Interactive Mockup Viewer</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Introduction */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Layout className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Medicine Reimbursement HRIS System</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore individual mockups of our comprehensive medicine reimbursement system. 
                Click on any component below to view detailed interfaces and workflows.
              </p>
              
              {/* Brand Colors Display */}
              <div className="flex items-center justify-center space-x-4 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm">#6E0F86 Primary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  <span className="text-sm">#F165E3 Secondary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-muted"></div>
                  <span className="text-sm">#E1B3CE Accent</span>
                </div>
              </div>
            </div>

            {/* Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {mockups.map((mockup) => (
                <Card key={mockup.id} className="border-2 border-primary/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                          {mockup.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{mockup.title}</CardTitle>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(mockup.category)}>
                        {mockup.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {mockup.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleViewMockup(mockup)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Mockup
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Features Overview */}
            <Card className="border-2 border-secondary/20 bg-secondary/5">
              <CardHeader>
                <CardTitle className="text-secondary">Complete System Features</CardTitle>
                <CardDescription>
                  This mockup system demonstrates all key workflows and user interfaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Employee Features</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Secure login & profile management</li>
                      <li>• Multi-medicine reimbursement requests</li>
                      <li>• Real-time request tracking</li>
                      <li>• Document upload system</li>
                      <li>• Automatic cost calculations</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Admin Features</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Request review & approval workflow</li>
                      <li>• Employee account management</li>
                      <li>• Comprehensive reporting system</li>
                      <li>• Department-wise analytics</li>
                      <li>• Document verification tools</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">System Benefits</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Streamlined approval process</li>
                      <li>• Reduced paperwork & errors</li>
                      <li>• Transparent tracking system</li>
                      <li>• Automated calculations</li>
                      <li>• Comprehensive audit trail</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Toaster />
      </div>
    );
  }

  // Regular screen rendering with back to mockup viewer option
  return (
    <div className="min-h-screen">
      {/* Back to Mockup Viewer Button (appears on all screens except mockup viewer) */}
      {currentScreen !== 'mockup-viewer' && (
        <div className="fixed top-4 right-4 z-50">
          <Button 
            onClick={() => setCurrentScreen('mockup-viewer')}
            variant="outline" 
            size="sm"
            className="bg-white border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mockups
          </Button>
        </div>
      )}

      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'employee-dashboard' && (
        <EmployeeDashboard
          onLogout={handleLogout}
          onNewRequest={handleNewRequest}
          onNewOpticalRequest={handleNewOpticalRequest}
        />
      )}
      
      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}

      {currentScreen === 'line-manager-dashboard' && (
        <LineManagerDashboard onLogout={handleLogout} />
      )}

      {currentScreen === 'reimbursement-form' && (
        <ReimbursementForm
          onBack={handleBackToDashboard}
          onSubmit={handleSubmitRequest}
        />
      )}

      {currentScreen === 'optical-reimbursement-form' && (
        <OpticalReimbursementForm
          onBack={handleBackToDashboard}
          onSubmit={handleSubmitOpticalRequest}
        />
      )}

      {currentScreen === 'component-library' && (
        <ComponentLibrary onBack={() => setCurrentScreen('mockup-viewer')} />
      )}
      
      <Toaster />
    </div>
  );
}