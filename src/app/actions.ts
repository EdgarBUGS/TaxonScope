'use server';

import { identifyOrganism, IdentifyOrganismInput, IdentifyOrganismOutput } from '@/ai/flows/identify-organism';
import { organismSummarizer, OrganismSummarizerInput } from '@/ai/flows/taxonomy-summarizer';
import type { IdentificationResultData } from '@/lib/types';
import { apiRateLimiter, isQuotaError, getMockResponse } from '@/lib/api-utils';
import { cookies } from 'next/headers';

export async function identifyAndSummarizeOrganism(
  input: IdentifyOrganismInput
): Promise<IdentificationResultData> {
  try {
    console.log('Starting AI identification process...');
    console.log('Input received:', { photoDataUri: input.photoDataUri ? 'Data URI present' : 'No data URI' });
    
    // Enforce per-user capture limit via cookie (3 per 24h)
    const cookieStore = cookies();
    const CAPTURE_COOKIE_KEY = 'ts_caps';
    const MAX_CAPTURES_PER_WINDOW = 3;
    const WINDOW_SECONDS = 24 * 60 * 60; // 24 hours
    const existing = cookieStore.get(CAPTURE_COOKIE_KEY)?.value;
    let count = 0;
    if (existing) {
      const parsed = parseInt(existing, 10);
      if (!Number.isNaN(parsed)) count = parsed;
    }
    if (count >= MAX_CAPTURES_PER_WINDOW) {
      throw new Error('You have reached the maximum of 3 identifications for today. Please try again tomorrow.');
    }
    cookieStore.set(CAPTURE_COOKIE_KEY, String(count + 1), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: WINDOW_SECONDS,
      path: '/',
    });
    
    // Check if API key is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key is not configured');
    }
    
    // Check quota before making API calls
    const quota = apiRateLimiter.checkQuota();
    if (quota.isQuotaExceeded) {
      console.log('Quota exceeded, providing fallback response');
      return getMockResponse();
    }
    
    // Increment request count
    apiRateLimiter.incrementRequestCount();
    
    const identification: IdentifyOrganismOutput = await identifyOrganism(input);
    console.log('Identification completed:', identification);

    if (!identification.species) {
      throw new Error('Could not identify the organism.');
    }

    const summarizerInput: OrganismSummarizerInput = {
      domain: identification.domain,
      kingdom: identification.kingdom,
      phylum: identification.phylum,
      class: identification.class,
      order: identification.order,
      family: identification.family,
      genus: identification.genus,
      species: identification.species,
    };
    
    console.log('Starting summarization...');
    const summary = await organismSummarizer(summarizerInput);
    console.log('Summarization completed:', summary);

    return {
      ...identification,
      ...summary,
    };
  } catch (error) {
    console.error('Error in AI processing:', error);
    
    // Check if it's a quota error
    if (isQuotaError(error)) {
      console.log('Quota exceeded, providing fallback response for development');
      console.log('Quota status:', apiRateLimiter.getQuotaStatus());
      
      // Return a mock response for development when quota is exceeded
      return getMockResponse();
    }
    
    if (error instanceof Error) {
      throw new Error(`AI processing failed: ${error.message}`);
    }
    throw new Error('Failed to identify and summarize organism. Please try again.');
  }
}
