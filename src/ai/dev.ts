import { config } from 'dotenv';
config();

import '@/ai/flows/vulnerability-scanner.ts';
import '@/ai/flows/fix-suggestions.ts';
import '@/ai/flows/code-simplification.ts';
import '@/ai/flows/apply-fix.ts';
