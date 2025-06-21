// fix-suggestions.ts
'use server';

/**
 * @fileOverview AI-powered fix suggestions for identified vulnerabilities in Python code.
 *
 * - suggestFixes - A function that suggests fixes for vulnerabilities in the code.
 * - SuggestFixesInput - The input type for the suggestFixes function.
 * - SuggestFixesOutput - The return type for the suggestFixes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFixesInputSchema = z.object({
  code: z
    .string()
    .describe('The Python code to analyze for vulnerabilities.'),
  vulnerabilityReport: z
    .string()
    .describe('The vulnerability report for the given code.'),
});
export type SuggestFixesInput = z.infer<typeof SuggestFixesInputSchema>;

const SuggestFixesOutputSchema = z.object({
  suggestedFixes: z
    .array(z.string())
    .describe('Array of suggested fixes for the identified vulnerabilities.'),
});
export type SuggestFixesOutput = z.infer<typeof SuggestFixesOutputSchema>;

export async function suggestFixes(input: SuggestFixesInput): Promise<SuggestFixesOutput> {
  return suggestFixesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFixesPrompt',
  input: {schema: SuggestFixesInputSchema},
  output: {schema: SuggestFixesOutputSchema},
  prompt: `You are an AI-powered vulnerability scanner and code improvement tool. You are given a piece of code and a vulnerability report.

  Your task is to suggest fixes with code examples for the identified vulnerabilities so the developer can efficiently remediate security issues and improve code quality.

  Code: {{{code}}}
  Vulnerability Report: {{{vulnerabilityReport}}}

  Provide clear and concise fix suggestions with code examples.
  Each fix should be self-contained and directly applicable to the provided code.
  Ensure that the suggested fixes maintain the original logic and syntax of the code.

  Return an array of strings, where each string is a suggested fix.
  `,
});

const suggestFixesFlow = ai.defineFlow(
  {
    name: 'suggestFixesFlow',
    inputSchema: SuggestFixesInputSchema,
    outputSchema: SuggestFixesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
