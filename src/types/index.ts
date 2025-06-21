import type {VulnerabilityScannerOutput} from '@/ai/flows/vulnerability-scanner';

export type ScanHistoryItem = {
  id: string;
  fileName: string;
  timestamp: Date;
  code: string;
  result: VulnerabilityScannerOutput;
  simplifiedCode?: string;
};
