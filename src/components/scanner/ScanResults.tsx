"use client";

import { AlertTriangle, Wrench, Sparkles, FileCode, RotateCcw, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VulnerabilityScannerOutput } from "@/ai/flows/vulnerability-scanner";
import { useToast } from "@/hooks/use-toast";

interface ScanResultsProps {
  fileName: string;
  scanResult: VulnerabilityScannerOutput;
  originalCode: string;
  simplifiedCode?: string;
  onSimplify: () => void;
  isSimplifying: boolean;
  onReset: () => void;
  onApplyFix: (
    fix: VulnerabilityScannerOutput['vulnerabilities'][0] | VulnerabilityScannerOutput['improvements'][0],
    type: 'vulnerability' | 'improvement',
    index: number
  ) => void;
  isApplyingFix: string | null;
}

export default function ScanResults({
  fileName,
  scanResult,
  originalCode,
  simplifiedCode,
  onSimplify,
  isSimplifying,
  onReset,
  onApplyFix,
  isApplyingFix,
}: ScanResultsProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} Copied`, description: `The ${type.toLowerCase()} has been copied to your clipboard.` });
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <FileCode className="h-6 w-6 text-muted-foreground" />
                <CardTitle>{fileName}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Scan Another File
            </Button>
        </div>
        <CardDescription>
            Scan completed. Found {scanResult.vulnerabilities.length} vulnerabilities and {scanResult.improvements.length} potential improvements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vulnerabilities">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vulnerabilities">
              <AlertTriangle className="mr-2" />
              Vulnerabilities ({scanResult.vulnerabilities.length})
            </TabsTrigger>
            <TabsTrigger value="improvements">
              <Wrench className="mr-2" />
              Improvements ({scanResult.improvements.length})
            </TabsTrigger>
            <TabsTrigger value="simplify">
              <Sparkles className="mr-2" />
              Code Simplification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vulnerabilities" className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              {scanResult.vulnerabilities.map((vuln, index) => (
                <AccordionItem value={`vuln-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 text-left">
                      <Badge variant={getSeverityBadge(vuln.severity)}>{vuln.severity}</Badge>
                      <span>{vuln.description}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm"><strong className="font-medium text-muted-foreground">Location:</strong> <code className="font-code text-sm">{vuln.location}</code></p>
                    <div>
                      <h4 className="font-medium mb-2 text-muted-foreground">Suggested Fix:</h4>
                      <pre className="bg-muted p-4 relative font-code text-sm overflow-auto">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(vuln.suggestedFix, 'Fix')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <code>{vuln.suggestedFix}</code>
                      </pre>
                    </div>
                     <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => onApplyFix(vuln, 'vulnerability', index)}
                        disabled={!!isApplyingFix}
                      >
                        {isApplyingFix === `vulnerability-${index}` ? (
                          "Applying..."
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Apply Fix
                          </>
                        )}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="improvements" className="mt-4">
             <Accordion type="single" collapsible className="w-full">
              {scanResult.improvements.map((imp, index) => (
                <AccordionItem value={`imp-${index}`} key={index}>
                  <AccordionTrigger className="text-left">{imp.description}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm"><strong className="font-medium text-muted-foreground">Location:</strong> <code className="font-code text-sm">{imp.location}</code></p>
                     <div>
                      <h4 className="font-medium mb-2 text-muted-foreground">Suggested Code:</h4>
                      <pre className="bg-muted p-4 relative font-code text-sm overflow-auto">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(imp.suggestedCode, 'Code')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <code>{imp.suggestedCode}</code>
                      </pre>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => onApplyFix(imp, 'improvement', index)}
                        disabled={!!isApplyingFix}
                      >
                        {isApplyingFix === `improvement-${index}` ? (
                          "Applying..."
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Apply Improvement
                          </>
                        )}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="simplify" className="mt-4">
            {!simplifiedCode ? (
              <div className="text-center p-8 border-dashed border-2">
                <h3 className="font-headline text-lg">Simplify Your Code with AI</h3>
                <p className="text-muted-foreground mb-4">Minimize lines and memory usage while preserving logic.</p>
                <Button onClick={onSimplify} disabled={isSimplifying || !!isApplyingFix}>
                    {isSimplifying ? "Executing..." : "Run simplify.sh"}
                    {!isSimplifying && <Sparkles className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-headline mb-2 text-center">Original Code</h3>
                         <ScrollArea className="h-96 border">
                            <pre className="p-4 font-code text-sm relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(originalCode, 'Original Code')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <code>{originalCode}</code>
                            </pre>
                         </ScrollArea>
                    </div>
                    <div>
                        <h3 className="font-headline mb-2 text-center">Simplified Code</h3>
                        <ScrollArea className="h-96 border bg-primary/5 border-primary/20">
                             <pre className="p-4 font-code text-sm relative">
                                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(simplifiedCode, 'Simplified Code')}>
                                    <Copy className="h-4 w-4" />
                                 </Button>
                                 <code>{simplifiedCode}</code>
                            </pre>
                        </ScrollArea>
                    </div>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
