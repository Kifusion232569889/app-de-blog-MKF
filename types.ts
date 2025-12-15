export interface BlogPost {
  title: string;
  content: string; // The full markdown content
  imagePrompt: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: BlogPost | null;
  generatedImageUrl: string | null;
  isImageLoading: boolean;
}

export enum GeneratorMode {
  BLOG = 'BLOG',
  IMAGE = 'IMAGE',
  GAME = 'GAME'
}

export interface WixSettings {
  apiKey: string;
  siteId: string;
}

// Adventure Game Types

export interface GameRoom {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string }; // e.g., { "north": "room2" }
  encounter?: string; // Description of a blockage or challenge
  item?: string; // Item to pick up
  lockedBy?: string; // ID of item needed to enter (optional)
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
