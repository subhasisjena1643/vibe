"use client";

import * as React from "react";
import { ShieldCheck, History, Code2 } from "lucide-react";
import type { ScanHistoryItem } from "@/types";
import ScannerPage from "@/components/scanner/ScannerPage";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { Button } from "@/components/ui/button";

type View = "scanner" | "dashboard";

export default function GoodCodeApp() {
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
        return <ScannerPage key={initialScan?.id || 'new-scan'} addScanToHistory={addScanToHistory} initialScan={initialScan} setInitialScan={setInitialScan} />;
      case "dashboard":
        return <DashboardPage scanHistory={scanHistory} viewScan={viewScanFromHistory} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <Code2 className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter">GoodCode</h1>
        </div>
        <nav className="flex items-center gap-2 rounded-lg bg-secondary p-1">
          <Button
            variant={activeView === "scanner" ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setInitialScan(undefined);
              setActiveView("scanner");
            }}
            className="rounded-md"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Scanner
          </Button>
          <Button
            variant={activeView === "dashboard" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView("dashboard")}
            className="rounded-md"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </nav>
      </header>
      <main className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
}
