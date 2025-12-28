import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import toast from "react-hot-toast";
import { Pause, Play, LogOut } from "lucide-react";
>>>>>>> c2b3613 (rombak cak)

import Card from "@/components/ui/watch-and-memorize/card";
import Button from "@/components/ui/watch-and-memorize/button";
import Progress from "@/components/ui/watch-and-memorize/progress";

import {
<<<<<<< HEAD
  ALL_IMAGES,
=======
>>>>>>> c2b3613 (rombak cak)
  SHOW_COUNT,
  SHOW_DURATION_MS,
  TOTAL_TIME_SEC,
} from "@/pages/watch-and-memorize/gameConfig";
import type { GameImage, GamePhase } from "@/pages/watch-and-memorize/types";
import { prepareRoundImages } from "@/pages/watch-and-memorize/logic";
<<<<<<< HEAD
import { updateGamePlayCount } from "@/api/watchAndMemorizeApi";
import { toast } from "sonner";

const WatchAndMemorizeGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
=======
import api from "@/api/axios";

// Helper to resolve image URL
// Helper to resolve image URL
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Default to localhost:4000 if env is missing
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Normalize slashes
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
};

const WatchAndMemorizeGame = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

>>>>>>> c2b3613 (rombak cak)
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SEC);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [gameImages, setGameImages] = useState<GameImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [targets, setTargets] = useState<GameImage[]>([]);
  const [options, setOptions] = useState<GameImage[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const [correct, setCorrect] = useState<number>(0);
  const [wrong, setWrong] = useState<number>(0);
  
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [playCountSent, setPlayCountSent] = useState<boolean>(false);

<<<<<<< HEAD
=======
  // Fetch Game Data if projectId exists
  useEffect(() => {
    if (projectId) {
      const fetchGameData = async () => {
        try {
          setLoading(true);
          // Assuming the endpoint returns { data: { game_json: { images: [] } } } or similar
          const response = await api.get(`/api/game/game-type/watch-and-memorize/${projectId}/play/public`);
          const data = response.data.data;
          console.log("WatchAndMemorize DEBUG: API Response", data);

          // Check for game_json (standard) or fallback to game_data
          const gameContent = data.game_json || data.game_data;
          console.log("WatchAndMemorize DEBUG: Game Content", gameContent);

          if (gameContent && gameContent.images && Array.isArray(gameContent.images)) {
            const mappedImages: GameImage[] = gameContent.images.map((img: any, idx: number) => ({
              id: img.id || `img-${idx}`,
              src: getImageUrl(img.image || img.url),
              label: img.label || `Image ${idx + 1}`
            }));
            setGameImages(mappedImages);
          } else {
            console.error("WatchAndMemorize DEBUG: No images found!");
            toast.error("No images found in game data! Please edit the game and add images.");
          }
        } catch (err) {
          console.error("Failed to load game data:", err);
          toast.error("Failed to load game data.");
        } finally {
          setLoading(false);
        }
      };
      fetchGameData();
    }
  }, [projectId]);

  // Mulai satu ronde baru
>>>>>>> c2b3613 (rombak cak)
  const startRound = () => {
    if (gameImages.length < SHOW_COUNT) {
      console.warn(`WatchAndMemorize DEBUG: Only ${gameImages.length} images found. Need ${SHOW_COUNT}.`);
      toast.error(`Not enough images to play! Found ${gameImages.length}, need at least ${SHOW_COUNT}.`);
      return;
    }

    const { targets: t, options: o } = prepareRoundImages(
      gameImages,
      SHOW_COUNT,
    );
    setTargets(t);
    setOptions(o);
    setSelected([]);
    setCorrect(0);
    setWrong(0);

    setPhase("show");

    setTimeout(() => {
      setPhase((prev) => (prev === "show" ? "select" : prev));
    }, SHOW_DURATION_MS);
  };

  const startGame = async () => {
    setRound(1);
    setScore(0);
    setTimeLeft(TOTAL_TIME_SEC);
    setIsPaused(false);
    setGameStartTime(Date.now());
    
    startRound();
  };

  useEffect(() => {
<<<<<<< HEAD
    if (phase === "idle" || isPaused || phase === "result") return;
=======
    if (phase === "idle" || phase === "result" || isPaused) return;
>>>>>>> c2b3613 (rombak cak)

    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase("result");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, isPaused]);

  const timeProgress = useMemo(
    () => (timeLeft / TOTAL_TIME_SEC) * 100,
    [timeLeft],
  );

  const toggleSelect = (id: string) => {
    if (phase !== "select" || isPaused) return;

    // Check limit: max 4 selections logic
    if (selected.length >= 4 && !selected.includes(id)) {
      toast.error("Maksimal pilih 4 gambar!");
      return;
    }

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submitAnswer = () => {
    const targetSet = new Set(targets.map((i) => i.id));
    let c = 0;
    let w = 0;

    selected.forEach((id) => {
      if (targetSet.has(id)) c++;
      else w++;
    });

    const bonus = Math.floor(Math.max(timeLeft, 0) * 0.1);
    const gained = c * 10 - w * 5 + bonus;

    setScore((s) => s + gained);
    setCorrect(c);
    setWrong(w);
    setPhase("result");
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    startRound();
  };

  const togglePause = () => {
    if (phase === "idle" || phase === "result") return;
    setIsPaused((prev) => !prev);
<<<<<<< HEAD
    
    if (!isPaused) {
      toast.info("Game paused");
    } else {
      toast.info("Game resumed");
    }
  };

  const exitGame = async () => {
    if (gameId && !playCountSent) {
      try {
        await updateGamePlayCount(gameId);
        setPlayCountSent(true);
        toast.success("Game session recorded!");
      } catch (error) {
        console.error("Failed to update play count:", error);
      }
    }
    
    navigate("/");
  };

  useEffect(() => {
    if (phase === "show" && gameId && !playCountSent && gameStartTime > 0) {
      updateGamePlayCount(gameId)
        .then(() => setPlayCountSent(true))
        .catch((error) => console.error("Failed to update play count:", error));
    }
  }, [phase, gameId, playCountSent, gameStartTime]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl flex items-center justify-between px-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Watch &amp; Memorize</h1>
          <p className="text-sm text-slate-400">
            Round {round} • Score {score}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Progress value={timeProgress} />
            <p className="text-xs text-slate-400 text-right mt-1">
              {timeLeft}s
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={togglePause}
            disabled={phase === "idle" || phase === "result"}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          
          <Button variant="destructive" onClick={exitGame}>
            Exit
          </Button>
        </div>
      </div>

      {isPaused && phase !== "idle" && phase !== "result" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Game Paused</h2>
            <Button onClick={togglePause}>Resume Game</Button>
          </Card>
        </div>
      )}

      <Card className="w-full max-w-4xl">
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <h2 className="text-xl font-semibold">Cara Bermain</h2>
            <p className="text-sm text-slate-300">
              Lihat dan hafalkan gambar yang muncul, lalu pilih kembali gambar
              yang tadi kamu lihat. Cepat dan tepat dapat skor lebih tinggi.
            </p>
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}

        {phase === "show" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Hafalkan gambar berikut!
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {targets.map((img) => (
                <div
                  key={img.id}
                  className="rounded-xl overflow-hidden border border-slate-700"
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
=======
  };

  const exitGame = async () => {
    try {
      if (projectId) {
        // Using the new play-count endpoint from Quiz.tsx reference
        await api.post("/api/game/play-count", {
          game_id: projectId,
        });
      }
    } catch (err) {
      console.error("Failed to send play-count:", err);
    } finally {
      navigate(-1); // Go back
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black text-slate-100 flex flex-col items-center py-10 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-6 px-4">
        {/* Header */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl relative z-20">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight text-center md:text-left">
              Watch & Memorize
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-300 mt-1 justify-center md:justify-start">
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                Round <span className="text-cyan-400 font-bold">{round}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                Score <span className="text-yellow-400 font-bold">{score}</span>
              </span>
>>>>>>> c2b3613 (rombak cak)
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48 group">
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
                <span>Time Remaining</span>
                <span className={timeLeft < 10 ? "text-red-400 animate-pulse font-bold" : "text-cyan-400"}>{timeLeft}s</span>
              </div>
              <Progress value={timeProgress} className="h-2" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={togglePause} className="w-10 h-10 p-0 flex items-center justify-center rounded-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50" title={isPaused ? "Resume" : "Pause"}>
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </Button>
              <Button variant="destructive" onClick={exitGame} className="w-10 h-10 p-0 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50" title="Exit Game">
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Game Card */}
        <Card className="w-full relative overflow-hidden min-h-[500px] flex flex-col justify-center bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
          {/* PAUSE OVERLAY */}
          {isPaused && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="text-4xl font-black text-white tracking-widest animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                PAUSED
              </div>
            </div>
          )}

          {/* Phase: Idle / Intro */}
          {phase === "idle" && (
            <div className="flex flex-col items-center gap-8 p-10 text-center animate-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-[60px] opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 shadow-cyan-500/50 mb-4 z-10 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 16 16">
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-bold text-white">Siap Bermain?</h2>
                <p className="text-slate-300 leading-relaxed text-base">
                  Hafalkan gambar yang muncul secepat mungkin. <br />
                  <span className="text-cyan-400 font-semibold">Fokus</span> adalah kuncinya.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm w-full max-w-lg mt-4 text-white">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col items-center gap-2 hover:bg-slate-700/80 transition-colors">
                  <span className="text-2xl">👀</span>
                  <span className="font-semibold text-slate-200">Amati</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col items-center gap-2 hover:bg-slate-700/80 transition-colors">
                  <span className="text-2xl">🧠</span>
                  <span className="font-semibold text-slate-200">Hafalkan</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col items-center gap-2 hover:bg-slate-700/80 transition-colors">
                  <span className="text-2xl">👆</span>
                  <span className="font-semibold text-slate-200">Pilih</span>
                </div>
              </div>

              <Button onClick={startGame} className="w-full max-w-xs mt-6 py-3 text-lg shadow-cyan-500/20">
                Mulai Sekarang
              </Button>
            </div>
          )}

          {/* Phase: Show */}
          {phase === "show" && (
            <div className="p-8 flex flex-col h-full">
              <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  Hafalkan Gambar!
                </h2>
                <div className="h-1.5 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 flex-1 place-items-center content-center max-w-4xl mx-auto">
                {targets.map((img, idx) => (
                  <div
                    key={img.id}
<<<<<<< HEAD
                    type="button"
                    onClick={() => toggleSelect(img.id)}
                    disabled={isPaused}
                    className={`rounded-xl border overflow-hidden transition ${
                      sel
                        ? "border-emerald-400 ring-2 ring-emerald-500"
                        : "border-slate-700 hover:border-slate-500"
                    } ${isPaused ? "opacity-50 cursor-not-allowed" : ""}`}
=======
                    className="relative group w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-600/50 shadow-2xl animate-in zoom-in duration-500"
                    style={{ animationDelay: `${idx * 150}ms`, animationFillMode: "both" }}
>>>>>>> c2b3613 (rombak cak)
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                      <span className="text-white text-sm font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">{img.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

<<<<<<< HEAD
            <div className="mt-4 flex gap-3">
              {timeLeft > 0 && (
                <Button onClick={nextRound}>Next Round</Button>
              )}
              <Button variant="outline" onClick={exitGame}>
                Kembali ke Home
=======
          {/* Phase: Select */}
          {phase === "select" && (
            <div className="p-8 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-white">Tebak Gambar</h2>
                  <p className="text-slate-300 text-sm mt-1">Pilih <span className="text-cyan-400 font-bold">4</span> gambar yang muncul sebelumnya</p>
                </div>
                <Button
                  onClick={submitAnswer}
                  disabled={selected.length === 0 || isPaused}
                  className="w-full sm:w-auto min-w-[140px] shadow-lg shadow-cyan-500/20"
                >
                  Jawab ({selected.length}/4)
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 flex-1 max-w-4xl mx-auto">
                {options.map((img) => {
                  const sel = selected.includes(img.id);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => toggleSelect(img.id)}
                      disabled={isPaused}
                      className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 group focus:outline-none ${sel
                        ? "border-cyan-400 ring-4 ring-cyan-500/20 scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10"
                        : "border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50 opacity-90 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className={`w-full h-full object-cover transition-transform duration-500 ${sel ? "scale-110" : "group-hover:scale-105 saturate-50 group-hover:saturate-100"}`}
                      />
                      {sel && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-200">
                          <div className="bg-cyan-500 rounded-full p-2 shadow-lg shadow-cyan-500/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 16 16">
                              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Phase: Result */}
          {phase === "result" && (
            <div className="p-10 flex flex-col items-center justify-center h-full animate-in zoom-in duration-300">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-4xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
                  Round Selesai
                </h2>
                <p className="text-slate-300 text-lg">Berikut hasil permainanmu</p>
              </div>

              <div className="grid grid-cols-3 gap-6 w-full max-w-lg mb-8">
                <div className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="text-4xl font-bold text-emerald-400 drop-shadow">{correct}</span>
                  <span className="text-xs uppercase tracking-wider text-emerald-200/80 font-bold mt-1">Benar</span>
                </div>
                <div className="flex flex-col items-center bg-red-500/10 border border-red-500/30 p-5 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <span className="text-4xl font-bold text-red-500 drop-shadow">{wrong}</span>
                  <span className="text-xs uppercase tracking-wider text-red-200/80 font-bold mt-1">Salah</span>
                </div>
                <div className="flex flex-col items-center bg-blue-500/10 border border-blue-500/30 p-5 rounded-2xl col-span-1 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <span className="text-4xl font-bold text-blue-400 drop-shadow">{score}</span>
                  <span className="text-xs uppercase tracking-wider text-blue-200/80 font-bold mt-1">Total Score</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {timeLeft > 0 ? (
                  <Button onClick={nextRound} className="flex-1 py-3 text-lg shadow-lg">
                    Lanjut Round {round + 1}
                  </Button>
                ) : (
                  <div className="w-full text-center p-5 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-amber-400 font-bold mb-2 text-xl">Waktu Habis!</p>
                    <p className="text-sm text-slate-300">Permainan telah berakhir.</p>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={exitGame} className="mt-4 w-full max-w-md border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/50">
                Kembali ke Menu Utama
>>>>>>> c2b3613 (rombak cak)
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WatchAndMemorizeGame;
