export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
  iconType: 'study' | 'practice' | 'fun' | 'heart';
}

export interface RoadmapData {
  dreamTitle: string;
  encouragement: string;
  steps: RoadmapStep[];
}

export enum AppState {
  INTRO = 'INTRO',
  CHAT = 'CHAT',
  LOADING_ROADMAP = 'LOADING_ROADMAP',
  ROADMAP = 'ROADMAP'
}