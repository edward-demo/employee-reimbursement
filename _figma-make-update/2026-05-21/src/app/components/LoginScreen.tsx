import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Pill, UserCheck } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: 'employee' | 'admin') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@company.com"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            {/* Demo Login Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => onLogin('employee')} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Login as Employee
              </Button>
              <Button 
                onClick={() => onLogin('admin')} 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Login as Admin (Demo)
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

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Demo System - Click either button to explore the interface</p>
        </div>
      </div>
    </div>
  );
}