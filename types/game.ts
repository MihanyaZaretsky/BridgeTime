/**
 * BridgeTime Game Types
 * Defines the core data structures for the game state
 */

// Player role in the game - determines card drawing and visual theme
export type PlayerRole = 'past' | 'present';

// Time period for questions and cards
export type TimePeriod = 'past' | 'present';

// Question presentation format
export type QuestionFormat = 'text' | 'video' | 'audio';

// Answer option for a question
export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// A question from a scanned card
export interface Question {
  id: string;
  cardId: string;
  timePeriod: TimePeriod;
  format: QuestionFormat;
  title: string;
  content: string;           // Text content, video URL, or audio URL
  hint?: string;             // Optional hint for the question
  options: AnswerOption[];
  metadata?: {
    year?: number;           // Historical context year
    category?: string;       // e.g., "Music", "Events", "Daily Life"
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

// A single bridge segment earned by answering correctly
export interface BridgeSegment {
  id: string;
  earnedBy: PlayerRole;
  questionId: string;
  position: number;          // Position on the bridge (0 = first segment)
  timestamp: number;
}

// Player state in the game
export interface Player {
  role: PlayerRole;
  name: string;
  avatar?: string;
  bridgeSegments: BridgeSegment[];
  currentPosition: number;   // Position of token on bridge
  score: number;             // Total correct answers
}

// Overall game state
export interface GameState {
  id: string;
  status: 'setup' | 'playing' | 'paused' | 'finished';
  currentTurn: PlayerRole;
  players: {
    past: Player;
    present: Player;
  };
  bridgeLength: number;      // Total segments needed to win
  currentQuestion?: Question;
  history: GameHistoryEntry[];
  startedAt?: number;
  finishedAt?: number;
  winner?: PlayerRole;
}

// Record of a turn in game history
export interface GameHistoryEntry {
  turnNumber: number;
  player: PlayerRole;
  questionId: string;
  answeredCorrectly: boolean;
  timestamp: number;
}

// App navigation screens
export type AppScreen = 
  | 'welcome'
  | 'setup'
  | 'game'
  | 'scanner'
  | 'question'
  | 'result'
  | 'victory';

// QR code data structure
export interface QRCodeData {
  cardId: string;
  timePeriod: TimePeriod;
  questionId: string;
}

// Animation states for visual feedback
export interface AnimationState {
  riverFlow: boolean;
  bridgeBuilding: boolean;
  tokenMoving: boolean;
  celebrating: boolean;
}

// Game settings
export interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  animationsEnabled: boolean;
  bridgeLength: number;      // Default: 7 segments to win
}

// Default game settings
export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  animationsEnabled: true,
  bridgeLength: 7,
};

// Create initial player state
export const createPlayer = (role: PlayerRole, name: string): Player => ({
  role,
  name,
  bridgeSegments: [],
  currentPosition: 0,
  score: 0,
});

// Create initial game state
export const createInitialGameState = (
  pastPlayerName: string,
  presentPlayerName: string,
  bridgeLength: number = 7
): GameState => ({
  id: `game-${Date.now()}`,
  status: 'setup',
  currentTurn: 'past', // Past player starts first
  players: {
    past: createPlayer('past', pastPlayerName),
    present: createPlayer('present', presentPlayerName),
  },
  bridgeLength,
  history: [],
});
