"use client";

import * as React from "react";
import { ShieldCheck, History, Code } from "lucide-react";
import type { ScanHistoryItem } from "@/types";
import ScannerPage from "@/components/scanner/ScannerPage";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { Button } from "@/components/ui/button";

type View = "scanner" | "dashboard";

export default function GoodCodeCLI() {
  const [activeView, setActiveView] = React.useState<View>("scanner");
  const [scanHistory, setScanHistory] = React.useState<ScanHistoryItem[]>([]);
  const [initialScan, setInitialScan] = React.useState<ScanHistoryItem | undefined>(undefined);

  const addScanToHistory = (item: ScanHistoryItem) => {
    setScanHistory((prev) => {
      const existingIndex = prev.findIndex((scan) => scan.id === item.id);
      if (existingIndex > -1) {
        const newHistory = [...prev];
        newHistory[existingIndex] = item;
        return newHistory;
      }
      return [item, ...prev];
    });
  };

  const viewScanFromHistory = (item: ScanHistoryItem) => {
    setInitialScan(item);
    setActiveView("scanner");
  };

  const renderContent = () => {
    switch (activeView) {
      case "scanner":
        return <ScannerPage addScanToHistory={addScanToHistory} initialScan={initialScan} setInitialScan={setInitialScan} />;
      case "dashboard":
        return <DashboardPage scanHistory={scanHistory} viewScan={viewScanFromHistory} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-svh w-full flex-col bg-background font-code text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h1 className="font-bold">GoodCode.sh</h1>
        </div>
        <nav className="flex items-center gap-2">
          <Button
            variant={activeView === "scanner" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setInitialScan(undefined);
              setActiveView("scanner");
            }}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            ./scanner
          </Button>
          <Button
            variant={activeView === "dashboard" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveView("dashboard")}
          >
            <History className="mr-2 h-4 w-4" />
            ./history
          </Button>
        </nav>
      </header>
      <main className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <footer className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {`goodcode> `}
        <span className="animate-pulse">_</span>
      </footer>
    </div>
  );
}
