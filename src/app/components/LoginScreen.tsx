import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Pill, UserCheck, UserCog } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: 'employee' | 'admin', credentials?: { email: string; password: string }) => Promise<void> | void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isEmployeeLoginLoading, setIsEmployeeLoginLoading] = useState(false);
  const [isAdminLoginLoading, setIsAdminLoginLoading] = useState(false);

  const validateCredentials = () => {
    const isEmailBlank = email.trim().length === 0;
    const isPasswordBlank = password.length === 0;

    if (isEmailBlank && isPasswordBlank) {
      return "Enter your email address and password.";
    }

    if (isEmailBlank) {
      return "Enter your email address.";
    }

    if (isPasswordBlank) {
      return "Enter your password.";
    }

    return "";
  };

  const handleCredentialSubmit = () => {
    const message = validateCredentials();
    setValidationMessage(message || "Choose Login as Employee or Login as Admin.");
  };

  const handleRoleLogin = async (role: 'employee' | 'admin') => {
    const message = validateCredentials();
    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    if (role === 'employee') {
      setIsEmployeeLoginLoading(true);
    } else {
      setIsAdminLoginLoading(true);
    }

    try {
      await onLogin(role, { email, password });
    } catch (error) {
      setValidationMessage(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      if (role === 'employee') {
        setIsEmployeeLoginLoading(false);
      } else {
        setIsAdminLoginLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary p-3 rounded-full">
              <Pill className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">MedReimburse</h1>
          <p className="text-muted-foreground">Employee Medicine Reimbursement System</p>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-4"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCredentialSubmit();
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setValidationMessage("");
                }}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setValidationMessage("");
                }}
                className="border-primary/20 focus:border-primary"
              />
            </div>

            {validationMessage && (
              <p className="text-sm text-destructive" role="alert">
                {validationMessage}
              </p>
            )}
            
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => handleRoleLogin('employee')}
                disabled={isEmployeeLoginLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {isEmployeeLoginLoading ? "Signing in..." : "Login as Employee"}
              </Button>
              <Button 
                onClick={() => handleRoleLogin('admin')}
                disabled={isAdminLoginLoading}
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <UserCog className="mr-2 h-4 w-4" />
                {isAdminLoginLoading ? "Checking admin access..." : "Login as Admin"}
              </Button>
            </div>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <Button variant="link" className="text-primary">
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
