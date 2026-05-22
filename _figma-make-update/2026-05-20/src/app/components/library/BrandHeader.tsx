import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LucideIcon } from "lucide-react";

interface BrandHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  user?: {
    name: string;
    role: string;
    initials: string;
  };
  actions?: Array<{
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
}

export function BrandHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  user, 
  actions = [],
  maxWidth = '7xl'
}: BrandHeaderProps) {
  const getMaxWidthClass = (size: string) => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case '7xl': return 'max-w-7xl';
      default: return 'max-w-7xl';
    }
  };

  return (
    <header className="bg-white border-b-2 border-primary/10 shadow-sm">
      <div className={`${getMaxWidthClass(maxWidth)} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {Icon && (
              <div className="bg-primary p-2 rounded-lg">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-primary">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </>
            )}
            {actions.map((action, index) => (
              <Button 
                key={index}
                onClick={action.onClick} 
                variant={action.variant || "outline"} 
                size="sm"
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}