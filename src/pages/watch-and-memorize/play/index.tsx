import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "@/components/ui/watch-and-memorize/card";
import Button from "@/components/ui/watch-and-memorize/button";
import Progress from "@/components/ui/watch-and-memorize/progress";

import {
  ALL_IMAGES,
  SHOW_COUNT,
  SHOW_DURATION_MS,
  TOTAL_TIME_SEC,
} from "@/pages/watch-and-memorize/gameConfig";
import type { GameImage, GamePhase } from "@/pages/watch-and-memorize/types";
import { prepareRoundImages } from "@/pages/watch-and-memorize/logic";
import { updateGamePlayCount } from "@/api/watchAndMemorizeApi";
import { toast } from "sonner";

const WatchAndMemorizeGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SEC);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [targets, setTargets] = useState<GameImage[]>([]);
  const [options, setOptions] = useState<GameImage[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const [correct, setCorrect] = useState<number>(0);
  const [wrong, setWrong] = useState<number>(0);
  
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [playCountSent, setPlayCountSent] = useState<boolean>(false);

  const startRound = () => {
    const { targets: t, options: o } = prepareRoundImages(
      ALL_IMAGES,
      SHOW_COUNT,
    );
    setTargets(t);
    setOptions(o);
    setSelected([]);
    setCorrect(0);
    setWrong(0);

    setPhase("show");

    setTimeout(() => {
      setPhase("select");
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
    if (phase === "idle" || isPaused || phase === "result") return;

    const id = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, isPaused]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setPhase("result");
    }
  }, [timeLeft]);

  const timeProgress = useMemo(
    () => (timeLeft / TOTAL_TIME_SEC) * 100,
    [timeLeft],
  );

  const toggleSelect = (id: string) => {
    if (phase !== "select" || isPaused) return;

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
            </div>
          </div>
        )}

        {phase === "select" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Pilih gambar yang tadi muncul
              </h2>
              <Button
                onClick={submitAnswer}
                disabled={selected.length === 0 || isPaused}
              >
                Submit
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {options.map((img) => {
                const sel = selected.includes(img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggleSelect(img.id)}
                    disabled={isPaused}
                    className={`rounded-xl border overflow-hidden transition ${
                      sel
                        ? "border-emerald-400 ring-2 ring-emerald-500"
                        : "border-slate-700 hover:border-slate-500"
                    } ${isPaused ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <h2 className="text-xl font-semibold">Hasil Round {round}</h2>
            <div className="flex gap-4 text-sm">
              <div className="px-3 py-2 rounded-lg bg-emerald-900/40">
                Benar: {correct}
              </div>
              <div className="px-3 py-2 rounded-lg bg-red-900/40">
                Salah: {wrong}
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-800">
                Total Score: {score}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              {timeLeft > 0 && (
                <Button onClick={nextRound}>Next Round</Button>
              )}
              <Button variant="outline" onClick={exitGame}>
                Kembali ke Home
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WatchAndMemorizeGame;
