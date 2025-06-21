"use client";

import * as React from "react";
import { History, Eye, ShieldAlert, Wrench } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ScanHistoryItem } from "@/types";
import { Badge } from "@/components/ui/badge";

interface DashboardPageProps {
  scanHistory: ScanHistoryItem[];
  viewScan: (item: ScanHistoryItem) => void;
}

export default function DashboardPage({ scanHistory, viewScan }: DashboardPageProps) {
  if (scanHistory.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed bg-card shadow-sm">
        <div className="text-center">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-headline">No Scans Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Upload a C++ file or paste your code on the Scanner page to see your history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Scan History</CardTitle>
        <CardDescription>
          Review your past code scans and their results. Click a file name to see the full report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Scanned On</TableHead>
              <TableHead className="text-center">Results</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scanHistory.map((scan) => (
              <TableRow key={scan.id}>
                <TableCell>
                   <button
                      onClick={() => viewScan(scan)}
                      className="font-medium text-left transition-colors hover:text-primary font-code"
                    >
                      {scan.fileName}
                    </button>
                </TableCell>
                <TableCell>{format(scan.timestamp, "PPP p")}</TableCell>
                <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-4">
                        <Badge variant={scan.result.vulnerabilities.length > 0 ? "destructive" : "secondary"} className="gap-2">
                           <ShieldAlert className="h-4 w-4" /> {scan.result.vulnerabilities.length}
                        </Badge>
                         <Badge variant="secondary" className="gap-2">
                           <Wrench className="h-4 w-4" /> {scan.result.improvements.length}
                        </Badge>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => viewScan(scan)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
