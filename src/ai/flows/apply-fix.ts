'use server';
/**
 * @fileOverview This file defines a Genkit flow for applying a suggested code fix.
 *
 * It takes the original code and a description of the fix, and returns the full code with the fix applied.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyFixInputSchema = z.object({
  code: z.string().describe('The original C++ code.'),
  fixDescription: z.string().describe('A description of the fix to be applied, including the location and suggested code.'),
});
export type ApplyFixInput = z.infer<typeof ApplyFixInputSchema>;

const ApplyFixOutputSchema = z.object({
  fixedCode: z.string().describe('The full C++ code with the fix applied.'),
});
export type ApplyFixOutput = z.infer<typeof ApplyFixOutputSchema>;

/**
 * Applies a suggested fix to the given C++ code.
 * @param {ApplyFixInput} input - The input containing the code and the fix description.
 * @returns {Promise<ApplyFixOutput>} - A promise resolving to the code with the fix applied.
 */
export async function applyFix(input: ApplyFixInput): Promise<ApplyFixOutput> {
  return applyFixFlow(input);
}

const applyFixPrompt = ai.definePrompt({
  name: 'applyFixPrompt',
  input: {schema: ApplyFixInputSchema},
  output: {schema: ApplyFixOutputSchema},
  prompt: `You are an expert C++ programmer acting as a code-writing assistant. Your task is to apply a suggested fix to a piece of C++ code.

You will be given the original code and a detailed description of the fix to apply. This description includes the problem, its location, and the suggested code change.

Apply the change precisely as described. Return the ENTIRE, complete C++ code file with the fix integrated. Do not add any comments, explanations, or markdown formatting. Only output the raw, modified code.

Original Code:
\`\`\`cpp
{{{code}}}
\`\`\`

Fix to Apply:
{{{fixDescription}}}
`,
});

const applyFixFlow = ai.defineFlow(
  {
    name: 'applyFixFlow',
    inputSchema: ApplyFixInputSchema,
    outputSchema: ApplyFixOutputSchema,
  },
  async input => {
    const {output} = await applyFixPrompt(input);
    return output!;
  }
);
