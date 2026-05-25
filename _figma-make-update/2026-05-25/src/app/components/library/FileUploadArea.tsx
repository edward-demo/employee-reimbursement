import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Upload, Check, FileText, Image, File } from "lucide-react";

interface FileUploadAreaProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: string;
  icon?: 'file' | 'image' | 'document';
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  required?: boolean;
}

export function FileUploadArea({
  label,
  description,
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSize = "10MB",
  icon = 'document',
  onFileSelect,
  selectedFile,
  required = false
}: FileUploadAreaProps) {
  const [dragOver, setDragOver] = useState(false);

  const getIcon = () => {
    switch (icon) {
      case 'file': return File;
      case 'image': return Image;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const IconComponent = getIcon();
  const uploadId = `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <IconComponent className="h-4 w-4 mr-2" />
        {label} {required && '*'}
      </Label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-primary/60 bg-primary/5' 
            : selectedFile 
              ? 'border-green-300 bg-green-50'
              : 'border-primary/20 hover:border-primary/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => onFileSelect(null)}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {accept.replace(/\./g, '').toUpperCase()} up to {maxSize}
            </p>
            <input
              type="file"
              className="hidden"
              accept={accept}
              id={uploadId}
              onChange={handleFileChange}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById(uploadId)?.click()}
            >
              Choose File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}