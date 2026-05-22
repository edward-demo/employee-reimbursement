import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { StatusBadge, StatusType } from "./StatusBadge";
import { FileText, Eye } from "lucide-react";

interface RequestCardProps {
  request: {
    id: string;
    employeeName?: string;
    employeeId?: string;
    department?: string;
    medicineName: string;
    quantity: string;
    totalPrice: number;
    submittedDate: string;
    status: StatusType;
    remarks?: string;
  };
  variant?: 'employee' | 'admin';
  onViewDetails?: (id: string) => void;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  showDocuments?: boolean;
}

export function RequestCard({ 
  request, 
  variant = 'employee',
  onViewDetails,
  onApprove,
  onDeny,
  showDocuments = false
}: RequestCardProps) {
  return (
    <Card className="border-2 border-primary/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {variant === 'admin' && request.employeeName && (
              <>
                <h3 className="text-lg font-semibold">{request.employeeName}</h3>
                <p className="text-sm text-muted-foreground">
                  {request.employeeId} • {request.department}
                </p>
              </>
            )}
            {variant === 'employee' && (
              <>
                <h3 className="text-lg font-semibold">{request.medicineName}</h3>
                <p className="text-sm text-muted-foreground">Request ID: {request.id}</p>
              </>
            )}
          </div>
          <StatusBadge status={request.status} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {variant === 'admin' && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Medicine</label>
              <p className="font-medium">{request.medicineName}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Quantity</label>
            <p>{request.quantity}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {variant === 'admin' ? 'Amount' : 'Total Amount'}
            </label>
            <p className="font-semibold">₱{request.totalPrice}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
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
          <div className="flex items-center space-x-2">
            {showDocuments && (
              <>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Prescription
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              </>
            )}
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={() => onViewDetails(request.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
          </div>
          
          {variant === 'admin' && request.status === 'pending' && onApprove && onDeny && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeny(request.id)}
              >
                Deny
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(request.id)}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}