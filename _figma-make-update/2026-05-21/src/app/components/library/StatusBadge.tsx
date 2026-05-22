import { Badge } from "../ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export type StatusType = 'approved' | 'pending' | 'denied' | 'under-review' | 'processing';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'approved':
        return {
          className: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />,
          label: "Approved"
        };
      case 'pending':
        return {
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />,
          label: "Pending"
        };
      case 'denied':
        return {
          className: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />,
          label: "Denied"
        };
      case 'under-review':
        return {
          className: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />,
          label: "Under Review"
        };
      case 'processing':
        return {
          className: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />,
          label: "Processing"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 border-gray-200",
          icon: null,
          label: "Unknown"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={config.className}>
      {config.icon}
      {config.label}
    </Badge>
  );
}