
export interface BlogPost {
  id?: string;
  createdAt?: number;
  title: string;
  content: string;
  imagePrompt: string;
}

export type ImageStyle = 'cinematic' | 'abstract' | 'zen' | 'anatomical' | 'watercolor';
export type ImageSize = '1K' | '2K';

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: BlogPost | null;
  generatedImageUrl: string | null;
  isImageLoading: boolean;
}

export interface WordPressSettings {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

// Added missing WixSettings interface for Wix integration
export interface WixSettings {
  apiKey: string;
  siteId: string;
}

export interface GameRoom {
  id: string;
  name: string;
  description: string;
  exits: {
    [key: string]: string | undefined;
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  encounter?: string;
  item?: string;
}

export interface AdventureMap {
  title: string;
  intro: string;
  rooms: GameRoom[];
  startingRoomId: string;
}

export interface GameStateData {
  currentRoomId: string;
  inventory: string[];
  history: { type: 'system' | 'user' | 'error'; text: string }[];
  visitedRoomIds: string[];
  isGameOver: boolean;
}
