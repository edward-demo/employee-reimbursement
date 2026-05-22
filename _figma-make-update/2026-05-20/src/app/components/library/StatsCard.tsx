import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  borderColor?: 'primary' | 'secondary' | 'green' | 'yellow' | 'red' | 'blue';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  borderColor = 'primary',
  trend 
}: StatsCardProps) {
  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'border-l-primary';
      case 'secondary': return 'border-l-secondary';
      case 'green': return 'border-l-green-500';
      case 'yellow': return 'border-l-yellow-500';
      case 'red': return 'border-l-red-500';
      case 'blue': return 'border-l-blue-500';
      default: return 'border-l-primary';
    }
  };

  const getValueColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-secondary';
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      case 'blue': return 'text-blue-600';
      default: return 'text-primary';
    }
  };

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-secondary';
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      case 'blue': return 'text-blue-600';
      default: return 'text-primary';
    }
  };

  return (
    <Card className={`border-l-4 ${getBorderColorClass(borderColor)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {Icon && <Icon className={`h-5 w-5 mr-2 ${getIconColorClass(borderColor)}`} />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getValueColorClass(borderColor)}`}>
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}