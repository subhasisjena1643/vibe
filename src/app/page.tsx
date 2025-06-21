"use client";

import * as React from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  PanelLeft,
  Bot,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/icons";
import type { ScanHistoryItem } from "@/types";

import ScannerPage from "@/components/scanner/ScannerPage";
import DashboardPage from "@/components/dashboard/DashboardPage";

type View = "scanner" | "dashboard" | "teams";

export default function GoodCodeApp() {
  const [activeView, setActiveView] = React.useState<View>("scanner");
  const [scanHistory, setScanHistory] = React.useState<ScanHistoryItem[]>([]);
  const [initialScan, setInitialScan] = React.useState<ScanHistoryItem | undefined>(undefined);

  const addScanToHistory = (item: ScanHistoryItem) => {
    setScanHistory((prev) => [item, ...prev]);
  };

  const viewScanFromHistory = (item: ScanHistoryItem) => {
    setInitialScan(item);
    setActiveView('scanner');
  }

  const renderContent = () => {
    switch (activeView) {
      case "scanner":
        return <ScannerPage addScanToHistory={addScanToHistory} initialScan={initialScan} setInitialScan={setInitialScan} />;
      case "dashboard":
        return <DashboardPage scanHistory={scanHistory} viewScan={viewScanFromHistory} />;
      case "teams":
        return (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-headline">Team Collaboration is Coming Soon</h2>
              <p className="text-muted-foreground">
                Stay tuned for project-based scans and team management features.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Logo className="size-5 text-primary" />
            </Button>
            <span className="font-headline text-lg">GoodCode</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView("scanner")}
                isActive={activeView === "scanner"}
                tooltip="Vulnerability Scanner"
              >
                <ShieldCheck />
                <span>Scanner</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView("dashboard")}
                isActive={activeView === "dashboard"}
                tooltip="Reporting Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView("teams")}
                isActive={activeView === "teams"}
                tooltip="Team Collaboration (Beta)"
              >
                <Users />
                <span>Teams</span>
                <span className="ml-auto bg-accent/20 px-2 py-0.5 text-xs text-accent">
                  Beta
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="mb-2" />
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src="https://placehold.co/100x100.png"
                alt="User Avatar"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Demo User</span>
              <span className="text-xs text-muted-foreground">
                user@goodcode.dev
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <span className="text-primary font-bold text-xl">&gt;</span>
            <h1 className="text-lg font-headline md:text-xl">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
          </div>
          <Button variant="outline" size="sm">
            <span className="text-accent">[</span>UPGRADE<span className="text-accent">]</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
