"use client";
import * as React from "react";
import { AlertTriangle, Wrench, Sparkles, FileCode, RotateCcw, Copy, Wand2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VulnerabilityScannerOutput } from "@/ai/flows/vulnerability-scanner";
import { useToast } from "@/hooks/use-toast";

type Issue = VulnerabilityScannerOutput['vulnerabilities'][0] | VulnerabilityScannerOutput['improvements'][0];

interface ScanResultsProps {
  fileName: string;
  scanResult: VulnerabilityScannerOutput;
  originalCode: string;
  simplifiedCode?: string;
  onSimplify: () => void;
  isSimplifying: boolean;
  onReset: () => void;
  onApplyFix: (
    fix: Issue,
    type: 'vulnerability' | 'improvement',
    index: number
  ) => void;
  isApplyingFix: string | null;
}

const parseLocationToLineNumber = (location: string): number => {
  if (!location) return -1;
  const match = location.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : -1;
};

const getSeverityBadge = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
};


const CodeViewer = ({
  code,
  issue,
  onApply,
  isApplyingFix,
}: {
  code: string;
  issue: Issue | null;
  onApply: (() => void) | null;
  isApplyingFix: boolean;
}) => {
  const { toast } = useToast();
  const highlightedLine = issue ? parseLocationToLineNumber(issue.location) : -1;
  const lineRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    if (highlightedLine !== -1 && lineRefs.current[highlightedLine -1]) {
      lineRefs.current[highlightedLine - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedLine]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} Copied`, description: `The ${type.toLowerCase()} has been copied to your clipboard.` });
  };
  
  return (
    <Card className="h-full shadow-lg">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">Code Viewer</CardTitle>
         <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code, 'Code')}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[65vh] font-code text-sm">
          <pre className="p-1">
            {code.split('\n').map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = lineNumber === highlightedLine;
              return (
                <div
                  key={i}
                  ref={el => lineRefs.current[i] = el}
                  className={`relative px-4 py-1 transition-colors ${isHighlighted ? 'bg-primary/10' : ''}`}
                >
                  <span className="absolute left-0 w-10 text-right pr-4 text-muted-foreground/50 select-none">
                    {lineNumber}
                  </span>
                  {line}
                  {isHighlighted && onApply && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <Button
                            size="sm"
                            onClick={onApply}
                            disabled={isApplyingFix}
                            className="shadow-lg"
                        >
                            {isApplyingFix ? (
                            "Applying..."
                            ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Apply Fix
                            </>
                            )}
                        </Button>
                     </div>
                  )}
                </div>
              );
            })}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};


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
  const [activeTab, setActiveTab] = React.useState("vulnerabilities");
  const [selectedIssue, setSelectedIssue] = React.useState<{
    issue: Issue;
    type: 'vulnerability' | 'improvement';
    index: number;
  } | null>(null);

  const handleSelectIssue = (issue: Issue, type: 'vulnerability' | 'improvement', index: number) => {
    setSelectedIssue({ issue, type, index });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} Copied`, description: `The ${type.toLowerCase()} has been copied to your clipboard.` });
  };
  
  const currentFixId = selectedIssue ? `${selectedIssue.type}-${selectedIssue.index}` : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start h-full">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileCode className="h-6 w-6 text-muted-foreground" />
                    <CardTitle>{fileName}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { onReset(); setSelectedIssue(null); }}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Scan Another
                </Button>
            </div>
            <CardDescription>
                Scan completed. Select an issue below to view it in the code.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vulnerabilities">
              <ShieldAlert className="mr-2" />
              Vulnerabilities ({scanResult.vulnerabilities.length})
            </TabsTrigger>
            <TabsTrigger value="improvements">
              <Wrench className="mr-2" />
              Improvements ({scanResult.improvements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vulnerabilities" className="mt-4">
            <Card>
              <CardContent className="p-0">
                  {scanResult.vulnerabilities.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">No vulnerabilities found.</div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full" onValueChange={(value) => {
                      if (value) {
                        const index = parseInt(value.split('-')[1]);
                        handleSelectIssue(scanResult.vulnerabilities[index], 'vulnerability', index);
                      } else {
                        setSelectedIssue(null);
                      }
                    }}>
                    {scanResult.vulnerabilities.map((vuln, index) => (
                        <AccordionItem value={`vuln-${index}`} key={index}>
                        <AccordionTrigger className="px-6 text-left hover:bg-secondary/50">
                            <div className="flex items-center gap-4">
                            <Badge variant={getSeverityBadge(vuln.severity)}>{vuln.severity}</Badge>
                            <span>{vuln.description}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 px-6 bg-secondary/20">
                            <p className="text-sm pt-4"><strong className="font-medium text-muted-foreground">Location:</strong> <code className="font-code text-sm">{vuln.location}</code></p>
                            <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Suggested Fix:</h4>
                            <pre className="bg-muted p-4 relative font-code text-sm overflow-auto">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(vuln.suggestedFix, 'Fix')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <code>{vuln.suggestedFix}</code>
                            </pre>
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements" className="mt-4">
             <Card>
              <CardContent className="p-0">
                {scanResult.improvements.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">No improvements found.</div>
                ) : (
                    <Accordion type="single" collapsible className="w-full" onValueChange={(value) => {
                      if (value) {
                        const index = parseInt(value.split('-')[1]);
                        handleSelectIssue(scanResult.improvements[index], 'improvement', index);
                      } else {
                        setSelectedIssue(null);
                      }
                    }}>
                    {scanResult.improvements.map((imp, index) => (
                        <AccordionItem value={`imp-${index}`} key={index}>
                        <AccordionTrigger className="px-6 text-left hover:bg-secondary/50">{imp.description}</AccordionTrigger>
                        <AccordionContent className="space-y-4 px-6 bg-secondary/20">
                            <p className="text-sm pt-4"><strong className="font-medium text-muted-foreground">Location:</strong> <code className="font-code text-sm">{imp.location}</code></p>
                            <div>
                            <h4 className="font-medium mb-2 text-muted-foreground">Suggested Code:</h4>
                            <pre className="bg-muted p-4 relative font-code text-sm overflow-auto">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(imp.suggestedCode, 'Code')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <code>{imp.suggestedCode}</code>
                            </pre>
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                )}
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles /> Code Simplification</CardTitle>
                 <CardDescription>Minimize lines and memory usage while preserving logic.</CardDescription>
            </CardHeader>
            <CardContent>
                 {!simplifiedCode ? (
                    <Button onClick={onSimplify} disabled={isSimplifying || !!isApplyingFix}>
                        {isSimplifying ? "Simplifying..." : "Run AI Simplification"}
                        {!isSimplifying && <Sparkles className="ml-2 h-4 w-4" />}
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-green-400">Code has been simplified! The updated code is visible in the viewer.</p>
                        <p className="text-xs text-muted-foreground">Note: Applying fixes will use the most recent version of the code. Simplified code replaces the original.</p>
                    </div>
                )}
            </CardContent>
        </Card>

      </div>
      {/* Right Column */}
      <CodeViewer
        code={originalCode}
        issue={selectedIssue?.issue ?? null}
        onApply={selectedIssue ? () => onApplyFix(selectedIssue.issue, selectedIssue.type, selectedIssue.index) : null}
        isApplyingFix={isApplyingFix === currentFixId}
      />
    </div>
  );
}
