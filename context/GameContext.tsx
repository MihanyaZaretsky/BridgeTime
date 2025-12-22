/**
 * BridgeTime Game Context
 * Global state management for the game
 */

import {
    BridgeSegment,
    createInitialGameState,
    DEFAULT_SETTINGS,
    GameSettings,
    GameState,
    Player,
    PlayerRole,
    Question,
} from '@/types/game';
import React, { createContext, ReactNode, useContext, useReducer } from 'react';

// Action types for game state management
type GameAction =
  | { type: 'START_GAME'; pastName: string; presentName: string }
  | { type: 'SET_QUESTION'; question: Question }
  | { type: 'ANSWER_QUESTION'; playerId: PlayerRole; correct: boolean }
  | { type: 'ADD_BRIDGE_SEGMENT'; playerId: PlayerRole; segment: BridgeSegment }
  | { type: 'SWITCH_TURN' }
  | { type: 'SET_WINNER'; winner: PlayerRole }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> };

// Combined state for context
interface GameContextState {
  game: GameState | null;
  settings: GameSettings;
}

// Context value including state and actions
interface GameContextValue extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
  // Helper actions
  startGame: (pastName: string, presentName: string) => void;
  answerQuestion: (correct: boolean) => void;
  switchTurn: () => void;
  resetGame: () => void;
  getCurrentPlayer: () => Player | null;
  getOpponent: () => Player | null;
}

// Initial context state
const initialState: GameContextState = {
  game: null,
  settings: DEFAULT_SETTINGS,
};

// Reducer for game state
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        game: {
          ...createInitialGameState(action.pastName, action.presentName, state.settings.bridgeLength),
          status: 'playing',
          startedAt: Date.now(),
        },
      };

    case 'SET_QUESTION':
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          currentQuestion: action.question,
        },
      };

    case 'ANSWER_QUESTION': {
      if (!state.game) return state;
      const player = state.game.players[action.playerId];
      const newHistory = [
        ...state.game.history,
        {
          turnNumber: state.game.history.length + 1,
          player: action.playerId,
          questionId: state.game.currentQuestion?.id || '',
          answeredCorrectly: action.correct,
          timestamp: Date.now(),
        },
      ];

      if (action.correct) {
        // Add bridge segment and move token forward
        const newSegment: BridgeSegment = {
          id: `segment-${Date.now()}`,
          earnedBy: action.playerId,
          questionId: state.game.currentQuestion?.id || '',
          position: player.currentPosition,
          timestamp: Date.now(),
        };

        const updatedPlayer: Player = {
          ...player,
          bridgeSegments: [...player.bridgeSegments, newSegment],
          currentPosition: player.currentPosition + 1,
          score: player.score + 1,
        };

        // Check for winner
        const isWinner = updatedPlayer.currentPosition >= state.game.bridgeLength;

        return {
          ...state,
          game: {
            ...state.game,
            players: {
              ...state.game.players,
              [action.playerId]: updatedPlayer,
            },
            history: newHistory,
            currentQuestion: undefined,
            status: isWinner ? 'finished' : state.game.status,
            winner: isWinner ? action.playerId : undefined,
            finishedAt: isWinner ? Date.now() : undefined,
          },
        };
      } else {
        // Wrong answer - just record in history, turn will switch
        return {
          ...state,
          game: {
            ...state.game,
            history: newHistory,
            currentQuestion: undefined,
          },
        };
      }
    }

    case 'SWITCH_TURN':
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          currentTurn: state.game.currentTurn === 'past' ? 'present' : 'past',
        },
      };

    case 'SET_WINNER':
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          status: 'finished',
          winner: action.winner,
          finishedAt: Date.now(),
        },
      };

    case 'PAUSE_GAME':
      if (!state.game) return state;
      return {
        ...state,
        game: { ...state.game, status: 'paused' },
      };

    case 'RESUME_GAME':
      if (!state.game) return state;
      return {
        ...state,
        game: { ...state.game, status: 'playing' },
      };

    case 'RESET_GAME':
      return {
        ...state,
        game: null,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    default:
      return state;
  }
}

// Create context
const GameContext = createContext<GameContextValue | null>(null);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Helper functions
  const startGame = (pastName: string, presentName: string) => {
    dispatch({ type: 'START_GAME', pastName, presentName });
  };

  const answerQuestion = (correct: boolean) => {
    if (!state.game) return;

    const currentRole = state.game.currentTurn;
    const currentPlayer = state.game.players[currentRole];
    const wouldWin = correct && currentPlayer.currentPosition + 1 >= state.game.bridgeLength;

    dispatch({ type: 'ANSWER_QUESTION', playerId: currentRole, correct });

    // Turns always alternate, even after a correct answer.
    // Exception: if the correct answer finishes the game, keep the winner as current.
    if (!wouldWin) {
      dispatch({ type: 'SWITCH_TURN' });
    }
  };

  const switchTurn = () => {
    dispatch({ type: 'SWITCH_TURN' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const getCurrentPlayer = (): Player | null => {
    if (!state.game) return null;
    return state.game.players[state.game.currentTurn];
  };

  const getOpponent = (): Player | null => {
    if (!state.game) return null;
    const opponentRole = state.game.currentTurn === 'past' ? 'present' : 'past';
    return state.game.players[opponentRole];
  };

  const value: GameContextValue = {
    ...state,
    dispatch,
    startGame,
    answerQuestion,
    switchTurn,
    resetGame,
    getCurrentPlayer,
    getOpponent,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook to use game context
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Hook to get current player's theme colors
export function usePlayerTheme(role?: PlayerRole) {
  const { game } = useGame();
  const currentRole = role || game?.currentTurn || 'past';
  return currentRole;
}
