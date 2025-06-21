'use server';

/**
 * @fileOverview This file defines a Genkit flow for simplifying Python code.
 *
 * It takes Python code as input and returns a simplified version of the code.
 * The simplification process minimizes lines and memory usage while preserving the original logic and syntax.
 *
 * @module src/ai/flows/code-simplification
 *
 * @interface CodeSimplificationInput - Defines the input schema for the code simplification flow.
 * @interface CodeSimplificationOutput - Defines the output schema for the code simplification flow.
 * @function simplifyCode - The main function that triggers the code simplification flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @interface CodeSimplificationInput
 * @description Defines the input schema for the code simplification flow.
 * @property {string} code - The Python code to be simplified.
 */
const CodeSimplificationInputSchema = z.object({
  code: z.string().describe('The Python code to be simplified.'),
});
export type CodeSimplificationInput = z.infer<typeof CodeSimplificationInputSchema>;

/**
 * @interface CodeSimplificationOutput
 * @description Defines the output schema for the code simplification flow.
 * @property {string} simplifiedCode - The simplified Python code.
 */
const CodeSimplificationOutputSchema = z.object({
  simplifiedCode: z.string().describe('The simplified Python code.'),
});
export type CodeSimplificationOutput = z.infer<typeof CodeSimplificationOutputSchema>;

/**
 * Simplifies the given Python code using an AI-powered Genkit flow.
 * @param {CodeSimplificationInput} input - The input containing the Python code to simplify.
 * @returns {Promise<CodeSimplificationOutput>} - A promise resolving to the simplified Python code.
 */
export async function simplifyCode(input: CodeSimplificationInput): Promise<CodeSimplificationOutput> {
  return simplifyCodeFlow(input);
}

const simplifyCodePrompt = ai.definePrompt({
  name: 'simplifyCodePrompt',
  input: {schema: CodeSimplificationInputSchema},
  output: {schema: CodeSimplificationOutputSchema},
  prompt: `You are an AI code simplification expert. Your goal is to simplify the given Python code while maintaining its original functionality, logic, and syntax.

Minimize the number of lines and optimize for memory usage where possible. Provide only the simplified code as the output.

Original Code:
{{code}}`,
});

const simplifyCodeFlow = ai.defineFlow(
  {
    name: 'simplifyCodeFlow',
    inputSchema: CodeSimplificationInputSchema,
    outputSchema: CodeSimplificationOutputSchema,
  },
  async input => {
    const {output} = await simplifyCodePrompt(input);
    return output!;
  }
);
