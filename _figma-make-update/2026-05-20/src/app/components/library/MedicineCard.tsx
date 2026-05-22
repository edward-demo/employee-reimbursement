import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Pill, Trash2 } from "lucide-react";

interface MedicineCardProps {
  medicine: {
    id: string;
    name: string;
    quantity: string;
    unitPrice: string;
    subtotal: number;
  };
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}

export function MedicineCard({ 
  medicine, 
  index, 
  canRemove, 
  onUpdate, 
  onRemove 
}: MedicineCardProps) {
  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Pill className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Medicine {index + 1}</h4>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(medicine.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Medicine Name *</Label>
            <Input
              placeholder="e.g., Paracetamol 500mg"
              value={medicine.name}
              onChange={(e) => onUpdate(medicine.id, 'name', e.target.value)}
              className="border-primary/30 focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              placeholder="e.g., 30"
              type="number"
              step="0.01"
              value={medicine.quantity}
              onChange={(e) => onUpdate(medicine.id, 'quantity', e.target.value)}
              className="border-primary/30 focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Unit Price (₱) *</Label>
            <Input
              placeholder="0.00"
              type="number"
              step="0.01"
              value={medicine.unitPrice}
              onChange={(e) => onUpdate(medicine.id, 'unitPrice', e.target.value)}
              className="border-primary/30 focus:border-primary"
            />
          </div>
        </div>
        
        {/* Subtotal Display */}
        <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal:</span>
            <span className="font-semibold text-secondary">₱{medicine.subtotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}