"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface FileUploadProps {
  onCodeSubmitted: (content: string, name: string) => void;
}

export default function FileUpload({ onCodeSubmitted }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [pastedCode, setPastedCode] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    const allowedExtensions = ['.cpp', '.cxx', '.cc', '.c++', '.h', '.hpp', '.hh', '.h++'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.'));
    
    if (file && allowedExtensions.includes(fileExtension.toLowerCase())) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onCodeSubmitted(content, file.name);
      };
      reader.readAsText(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a valid C++ file (.cpp, .cxx, .cc, .h, .hpp).",
      });
    }
  };
  
  const handlePastedCodeSubmit = () => {
    if (pastedCode.trim()) {
      onCodeSubmitted(pastedCode, 'PastedCode.cpp');
    } else {
      toast({
        variant: "destructive",
        title: "Empty Code",
        description: "Please paste some C++ code to analyze.",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardContent
        className="p-6 space-y-6"
      >
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-border"
          }`}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="font-headline text-xl">
              Drag & drop your C++ file here
            </h3>
            <p className="text-muted-foreground">
              or click to browse your files
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Browse File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".cpp,.cxx,.cc,.h,.hpp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-sm font-medium text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-4">
          <h3 className="font-headline text-xl text-center">
            Paste your C++ code to analyze
          </h3>
          <Textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="int main() {&#10;  std::cout << &quot;Hello, World!&quot; << std::endl;&#10;  return 0;&#10;}"
            className="font-code h-64 bg-muted/50"
          />
          <div className="flex justify-center">
            <Button onClick={handlePastedCodeSubmit}>Analyze Pasted Code</Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
