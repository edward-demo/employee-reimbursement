import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Edit, UserX, RotateCcw, Mail, Building } from "lucide-react";

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    department: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
    role?: string;
    joinDate?: string;
  };
  onEdit?: (id: string) => void;
  onResetPassword?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  variant?: 'card' | 'list';
}

export function EmployeeCard({ 
  employee, 
  onEdit, 
  onResetPassword, 
  onToggleStatus,
  variant = 'list'
}: EmployeeCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="text-red-600 border-red-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (variant === 'card') {
    return (
      <div className="bg-white border border-primary/10 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.id}</p>
          </div>
          {getStatusBadge(employee.status)}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            {employee.department}
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            {employee.email}
          </div>
          {employee.role && (
            <div className="text-sm text-muted-foreground">
              Role: {employee.role}
            </div>
          )}
          {employee.joinDate && (
            <div className="text-sm text-muted-foreground">
              Joined: {employee.joinDate}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(employee.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onResetPassword && (
            <Button variant="outline" size="sm" onClick={() => onResetPassword(employee.id)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          {onToggleStatus && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggleStatus(employee.id)}
              className={employee.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
            >
              <UserX className="h-4 w-4 mr-2" />
              {employee.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // List variant
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(employee.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-medium">{employee.name}</h4>
          <p className="text-sm text-muted-foreground">
            {employee.id} • {employee.department} • {employee.email}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusBadge(employee.status)}
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(employee.id)}>
            Edit
          </Button>
        )}
        {onResetPassword && (
          <Button variant="outline" size="sm" onClick={() => onResetPassword(employee.id)}>
            Reset Password
          </Button>
        )}
      </div>
    </div>
  );
}