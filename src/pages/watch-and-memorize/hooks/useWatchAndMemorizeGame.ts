import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getWatchAndMemorizeGames,
  getGameById,
  updateGamePlayCount,
  submitScore,
  getGameLeaderboard,
  toggleGameLike,
  type GamePlayData,
  type LeaderboardEntry,
} from "@/api/watchAndMemorizeApi";

export const useWatchAndMemorizeGame = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [games, setGames] = useState([]);

  // Fetch all watch-and-memorize games
  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getWatchAndMemorizeGames();
      setGames(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to fetch games");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch specific game
  const fetchGameById = useCallback(async (gameId: string) => {
    try {
      setIsLoading(true);
      const response = await getGameById(gameId);
      return response.data;
    } catch (error) {
      console.error("Error fetching game:", error);
      toast.error("Failed to fetch game");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start playing a game (increment play count)
  const startGame = useCallback(async (gameId?: string) => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      await updateGamePlayCount(gameId);
    } catch (error) {
      console.error("Failed to increment play count:", error);
      toast.error("Failed to record game start");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit game score to leaderboard
  const submitGameScore = useCallback(async (gamePlayData: GamePlayData) => {
    try {
      setIsLoading(true);
      await submitScore(gamePlayData);
      toast.success("Score submitted successfully!");
    } catch (error) {
      console.error("Failed to submit score:", error);
      toast.error("Failed to submit score");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch leaderboard for a game
  const fetchLeaderboard = useCallback(async (gameId: string, limit = 10) => {
    try {
      setIsLoading(true);
      const response = await getGameLeaderboard(gameId, limit);
      setLeaderboard(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to fetch leaderboard");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Like/unlike a game
  const likeGame = useCallback(async (gameId: string, isLike: boolean) => {
    try {
      await toggleGameLike(gameId, isLike);
      toast.success(isLike ? "Game liked!" : "Game unliked!");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  }, []);

  return {
    isLoading,
    games,
    leaderboard,
    fetchGames,
    fetchGameById,
    startGame,
    submitGameScore,
    fetchLeaderboard,
    likeGame,
  };
};