import api from "@/api/axios";
import { GAME_TEMPLATE_ID } from "@/pages/watch-and-memorize/gameConfig";

export interface GameData {
  id?: string;
  name: string;
  description?: string;
  thumbnail_image: string;
  game_template_id: string;
  is_published: boolean;
  game_json: {
    images: Array<{ id: string; src: string; label: string }>;
    showCount: number;
    showDurationMs: number;
    totalTimeSec: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  score: number;
  time_taken?: number;
  difficulty?: string;
  user?: {
    username: string;
    profile_picture?: string;
  };
  created_at: string;
}

export interface GamePlayData {
  game_id: string;
  score: number;
  time_taken: number;
  difficulty?: string;
}

// Get all games for watch-and-memorize template
export const getWatchAndMemorizeGames = async () => {
  const response = await api.get("/game", {
    params: {
      game_template_id: GAME_TEMPLATE_ID,
      limit: 100,
    },
  });
  return response.data;
};

// Get specific game by ID
export const getGameById = async (gameId: string) => {
  const response = await api.get(`/game/game-type/${gameId}`);
  return response.data;
};

// Create a new watch-and-memorize game
export const createWatchAndMemorizeGame = async (gameData: GameData) => {
  const response = await api.post("/game/game-type", {
    ...gameData,
    game_template_id: GAME_TEMPLATE_ID,
  });
  return response.data;
};

// Update game play count
export const updateGamePlayCount = async (gameId: string) => {
  const response = await api.post("/game/play-count", {
    game_id: gameId,
  });
  return response.data;
};

// Submit score to leaderboard
export const submitScore = async (gamePlayData: GamePlayData) => {
  const response = await api.post("/leaderboard", gamePlayData);
  return response.data;
};

// Get leaderboard for a specific game
export const getGameLeaderboard = async (gameId: string, limit = 10) => {
  const response = await api.get(`/leaderboard/${gameId}`, {
    params: { limit },
  });
  return response.data;
};

// Like/unlike a game
export const toggleGameLike = async (gameId: string, isLike: boolean) => {
  const response = await api.post("/game/like", {
    game_id: gameId,
    is_like: isLike,
  });
  return response.data;
};