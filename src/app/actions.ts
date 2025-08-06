'use server';

import { identifyOrganism, IdentifyOrganismInput, IdentifyOrganismOutput } from '@/ai/flows/identify-organism';
import { organismSummarizer, OrganismSummarizerInput } from '@/ai/flows/taxonomy-summarizer';
import type { IdentificationResultData } from '@/lib/types';

export async function identifyAndSummarizeOrganism(
  input: IdentifyOrganismInput
): Promise<IdentificationResultData> {
  try {
    const identification: IdentifyOrganismOutput = await identifyOrganism(input);

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

    const summary = await organismSummarizer(summarizerInput);

    return {
      ...identification,
      ...summary,
    };
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw new Error('Failed to identify and summarize organism. Please try again.');
  }
}
