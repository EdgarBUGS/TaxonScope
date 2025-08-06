import { IdentifyOrganismOutput } from "@/ai/flows/identify-organism";
import { OrganismSummarizerOutput } from "@/ai/flows/taxonomy-summarizer";

export type IdentificationResultData = IdentifyOrganismOutput & OrganismSummarizerOutput;

export interface HistoryItem extends IdentificationResultData {
  id: string;
  photoDataUri: string;
  timestamp: string;
}
