"use client";

import * as React from "react";
import {FileCode, Bot} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {runScan, runCodeSimplification, runApplyFix} from "@/app/actions";
import type {ScanHistoryItem} from "@/types";
import type {VulnerabilityScannerOutput} from "@/ai/flows/vulnerability-scanner";
import FileUpload from "./FileUpload";
import ScanResults from "./ScanResults";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

interface ScannerPageProps {
  addScanToHistory: (item: ScanHistoryItem) => void;
  initialScan?: ScanHistoryItem;
  setInitialScan: (item?: ScanHistoryItem) => void;
}

export default function ScannerPage({ addScanToHistory, initialScan, setInitialScan }: ScannerPageProps) {
  const [fileContent, setFileContent] = React.useState<string | null>(initialScan?.code ?? null);
  const [fileName, setFileName] = React.useState<string | null>(initialScan?.fileName ?? null);
  const [scanResult, setScanResult] = React.useState<VulnerabilityScannerOutput | null>(initialScan?.result ?? null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [simplifiedCode, setSimplifiedCode] = React.useState<string | undefined>(initialScan?.simplifiedCode);
  const [isSimplifying, setIsSimplifying] = React.useState(false);
  const [isApplyingFix, setIsApplyingFix] = React.useState<string | null>(null);
  const [currentHistoryItem, setCurrentHistoryItem] = React.useState<ScanHistoryItem | null>(initialScan ?? null);
  const {toast} = useToast();

  React.useEffect(() => {
    // This effect ensures the component state is correctly initialized when viewing a scan from history.
    if (initialScan) {
      setFileContent(initialScan.code);
      setFileName(initialScan.fileName);
      setScanResult(initialScan.result);
      setSimplifiedCode(initialScan.simplifiedCode);
      setCurrentHistoryItem(initialScan);
    }
  }, [initialScan]);


  React.useEffect(() => {
    // Clear initial scan after it has been loaded and the user navigates away
    return () => {
      setInitialScan(undefined);
    }
  }, [setInitialScan]);

  const handleCodeSubmit = async (content: string, name: string) => {
    setFileContent(content);
    setFileName(name);
    setScanResult(null);
    setSimplifiedCode(undefined);
    setCurrentHistoryItem(null);
    setIsScanning(true);

    try {
      const {data, error} = await runScan({cppCode: content});
      if (error || !data) {
        throw new Error(error || "No data returned from scan.");
      }
      setScanResult(data);
      const historyItem: ScanHistoryItem = {
        id: new Date().toISOString(),
        fileName: name,
        timestamp: new Date(),
        code: content,
        result: data,
      };
      addScanToHistory(historyItem);
      setCurrentHistoryItem(historyItem);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Could not scan the provided file. Please try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimplifyCode = async () => {
    if (!fileContent || !currentHistoryItem) return;
    setIsSimplifying(true);
    try {
      const {data, error} = await runCodeSimplification({code: fileContent});
      if (error || !data) {
        throw new Error(error || "No data returned from simplification.");
      }
      const newSimplifiedCode = data.simplifiedCode;
      
      // Update the main code content to the simplified version
      setFileContent(newSimplifiedCode); 
      setSimplifiedCode(newSimplifiedCode);

      const updatedItem: ScanHistoryItem = {
        ...currentHistoryItem,
        code: newSimplifiedCode, // The simplified code becomes the new base code
        simplifiedCode: newSimplifiedCode,
      };
      addScanToHistory(updatedItem);
      setCurrentHistoryItem(updatedItem);
      toast({
        title: "Code Simplified",
        description: "The simplified code is now the active version in the editor. You may re-scan for new insights."
      })

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Simplification Failed",
        description:
          "Could not simplify the code. Please try again.",
      });
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleApplyFix = async (
    fix: VulnerabilityScannerOutput['vulnerabilities'][0] | VulnerabilityScannerOutput['improvements'][0],
    type: 'vulnerability' | 'improvement',
    index: number
  ) => {
    if (!fileContent || !currentHistoryItem) return;

    const fixId = `${type}-${index}`;
    setIsApplyingFix(fixId);

    const fixDescription = `
      Description: ${fix.description}
      Location: ${fix.location}
      Suggested Change:
      \`\`\`cpp
      ${'suggestedFix' in fix ? fix.suggestedFix : fix.suggestedCode}
      \`\`\`
    `;

    try {
      const { data, error } = await runApplyFix({ code: fileContent, fixDescription });
      if (error || !data) {
        throw new Error(error || "No data returned from applying fix.");
      }

      const newCode = data.fixedCode;
      setFileContent(newCode);

      // Clear the scan results as they are now stale
      setScanResult({ vulnerabilities: [], improvements: [] });

      // Create a new history item for this edit
      const newHistoryItem: ScanHistoryItem = {
        ...currentHistoryItem,
        id: new Date().toISOString(), // new ID for this state
        code: newCode,
        // The old results are stale, so we clear them.
        result: { vulnerabilities: [], improvements: [] }, 
      };

      addScanToHistory(newHistoryItem);
      setCurrentHistoryItem(newHistoryItem);

      toast({
        title: "Fix Applied",
        description: "The code has been updated. Re-scan for an up-to-date report.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to Apply Fix",
        description: "Could not apply the suggested fix. Please try again.",
      });
    } finally {
      setIsApplyingFix(null);
    }
  };

  const resetScanner = () => {
    setFileContent(null);
    setFileName(null);
    setScanResult(null);
    setSimplifiedCode(undefined);
    setInitialScan(undefined);
    setCurrentHistoryItem(null);
  };

  if (isScanning) {
    return <LoadingState fileName={fileName} />;
  }
  
  return (
    <div className="w-full h-full">
      {!fileContent || !scanResult ? (
        <FileUpload onCodeSubmitted={handleCodeSubmit} />
      ) : (
        <ScanResults
          fileName={fileName!}
          scanResult={scanResult!}
          originalCode={fileContent}
          simplifiedCode={simplifiedCode}
          onSimplify={handleSimplifyCode}
          isSimplifying={isSimplifying}
          onReset={resetScanner}
          onApplyFix={handleApplyFix}
          isApplyingFix={isApplyingFix}
        />
      )}
    </div>
  );
}

function LoadingState({fileName}: {fileName: string | null}) {
  return (
    <Card className="w-full max-w-2xl mx-auto animate-pulse shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <FileCode className="h-6 w-6 text-muted-foreground" />
            <CardTitle>{fileName || "Analyzing your code..."}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex items-center space-x-4">
          <Bot className="h-10 w-10 text-primary animate-bounce" />
          <div className="space-y-2 flex-1">
            <p className="font-medium font-headline text-primary">GoodCode AI is scanning for vulnerabilities...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments. Please wait.</p>
          </div>
        </div>
        <Skeleton className="h-8 w-1/3 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
