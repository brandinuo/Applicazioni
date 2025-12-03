export enum SourceType {
  BIBLIOGRAPHIC = 'Bibliografico',
  HISTORICAL = 'Storico',
  LITERARY = 'Letterario',
  ALL = 'Tutte le fonti'
}

export interface SourceItem {
  id: string;
  title: string;
  author: string;
  year?: string;
  type: string;
  description: string;
  url?: string;
  citation: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ResearchResult {
  items: SourceItem[];
  rawText?: string;
  groundingLinks: { title: string; url: string }[];
}
