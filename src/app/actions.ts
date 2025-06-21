// src/app/actions.ts
'use server';

import {
  vulnerabilityScanner,
  VulnerabilityScannerInput,
  VulnerabilityScannerOutput,
} from '@/ai/flows/vulnerability-scanner';
import {
  simplifyCode,
  CodeSimplificationInput,
  CodeSimplificationOutput,
} from '@/ai/flows/code-simplification';

export async function runScan(
  input: VulnerabilityScannerInput
): Promise<{data: VulnerabilityScannerOutput | null; error: string | null}> {
  try {
    const result = await vulnerabilityScanner(input);
    return {data: result, error: null};
  } catch (e) {
    console.error(e);
    return {data: null, error: 'Failed to scan code. Please try again.'};
  }
}

export async function runCodeSimplification(
  input: CodeSimplificationInput
): Promise<{data: CodeSimplificationOutput | null; error: string | null}> {
  try {
    const result = await simplifyCode(input);
    return {data: result, error: null};
  } catch (e) {
    console.error(e);
    return {
      data: null,
      error: 'Failed to simplify code. Please try again.',
    };
  }
}
