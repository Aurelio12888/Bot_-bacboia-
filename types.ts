
export enum ResultColor {
  BLUE = 'BLUE',
  RED = 'RED',
  TIE = 'GREEN'
}

export interface GameResult {
  id: string;
  color: ResultColor;
  timestamp: number;
}

export interface AnalysisSignal {
  prediction: ResultColor | null;
  confidence: number;
  patternName: string;
}
