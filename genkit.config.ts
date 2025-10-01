import { defineConfig } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export default defineConfig({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
  enableTracingAndMetrics: true,
  logLevel: 'debug',
});




