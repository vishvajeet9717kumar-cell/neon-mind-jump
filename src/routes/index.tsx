import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: Game,
});

type Mode = "math" | "vocab" | "pattern";

type Question = { q: string; correct: string; wrong: string };

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function genMath(): Question {
  const ops = ["+", "-", "×"] as const;
  const op = pick(ops);
  let a = randInt(1, 12), b = randInt(1, 12), correct = 0;
  if (op === "+") correct = a + b;
  if (op === "-") { if (b > a) [a, b] = [b, a]; correct = a - b; }
  if (op === "×") { a = randInt(2, 9); b = randInt(2, 9); correct = a * b; }
  let wrong = correct + pick([-3, -2, -1, 1, 2, 3, 4, -4]);
  if (wrong === correct || wrong < 0) wrong = correct + 5;
  return { q: `${a} ${op} ${b}`, correct: String(correct), wrong: String(wrong) };
}

const VOCAB: { q: string; correct: string; wrong: string }[] = [
  { q: "Happy means…", correct: "Joyful", wrong: "Tired" },
  { q: "Big means…", correct: "Large", wrong: "Tiny" },
  { q: "Fast means…", correct: "Quick", wrong: "Slow" },
  { q: "Smart means…", correct: "Clever", wrong: "Dull" },
  { q: "Brave means…", correct: "Bold", wrong: "Afraid" },
  { q: "Cold means…", correct: "Chilly", wrong: "Warm" },
  { q: "Begin means…", correct: "Start", wrong: "End" },
  { q: "Tiny means…", correct: "Small", wrong: "Huge" },
  { q: "Quiet means…", correct: "Silent", wrong: "Loud" },
  { q: "Rich means…", correct: "Wealthy", wrong: "Poor" },
];
const genVocab = (): Question => pick(VOCAB);

function genPattern(): Question {
  const start = randInt(1, 9);
  const step = randInt(2, 5);
  const seq = [start, start + step, start + 2 * step];
  const correct = start + 3 * step;
  const wrong = correct + pick([-step, step + 1, -1, 2]);
  return { q: `${seq.join(", ")}, ?`, correct: String(correct), wrong: String(wrong === correct ? correct + 3 : wrong) };
}

const genQuestion = (mode: Mode): Question => {
  const q = mode === "math" ? genMath() : mode === "vocab" ? genVocab() : genPattern();
  // randomize which side is correct handled at gate creation
  return q;
};

interface Gate {
  x: number;
  topAnswer: string;
  bottomAnswer: string;
  correctSide: "top" | "bottom";
  question: string;
  gapY: number; // center between the two answer boxes
  passed: boolean;
}

const GATE_WIDTH = 70;
const ANSWER_HEIGHT = 110;
const GAP = 60; // gap between top and bottom answer boxes
const BIRD_R = 12;

// Simple beep using WebAudio
let audioCtx: AudioContext | null = null;
function beep(freq: number, dur = 0.08, type: OscillatorType = "sine", vol = 0.05) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch {}
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [screen, setScreen] = useState<"menu" | "play" | "over">("menu");
  const [mode, setMode] = useState<Mode>("math");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Mutable game state in refs to avoid re-renders during game loop
  const stateRef = useRef({
    birdY: 0,
    birdVy: 0,
    gates: [] as Gate[],
    speed: 2.2,
    width: 360,
    height: 640,
    spawnX: 0,
    running: false,
    mode: "math" as Mode,
    score: 0,
    onOver: (() => {}) as (s: number) => void,
  });

  useEffect(() => {
    const stored = Number(localStorage.getItem("flappy-edu-high") || 0);
    setHighScore(stored);
  }, []);

  const spawnGate = useCallback((x: number) => {
    const s = stateRef.current;
    const q = genQuestion(s.mode);
    const correctTop = Math.random() < 0.5;
    const minY = 120;
    const maxY = s.height - 120;
    const gapY = randInt(minY, maxY);
    s.gates.push({
      x,
      gapY,
      topAnswer: correctTop ? q.correct : q.wrong,
      bottomAnswer: correctTop ? q.wrong : q.correct,
      correctSide: correctTop ? "top" : "bottom",
      question: q.q,
      passed: false,
    });
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.birdY = s.height / 2;
    s.birdVy = 0;
    s.gates = [];
    s.speed = 2.2;
    s.score = 0;
    setScore(0);
    // initial gates
    spawnGate(s.width + 100);
    spawnGate(s.width + 100 + 280);
    spawnGate(s.width + 100 + 560);
  }, [spawnGate]);

  const startGame = (m: Mode) => {
    setMode(m);
    stateRef.current.mode = m;
    setScreen("play");
    requestAnimationFrame(() => {
      reset();
      stateRef.current.running = true;
    });
  };

  const flap = () => {
    const s = stateRef.current;
    if (!s.running) return;
    s.birdVy = -5.6;
    beep(640, 0.05, "square", 0.04);
  };

  // Game loop
  useEffect(() => {
    if (screen !== "play") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.width = rect.width;
      stateRef.current.height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const gameOver = () => {
      const s = stateRef.current;
      s.running = false;
      beep(180, 0.25, "sawtooth", 0.06);
      const fin = s.score;
      setScore(fin);
      setHighScore((prev) => {
        const nh = Math.max(prev, fin);
        localStorage.setItem("flappy-edu-high", String(nh));
        return nh;
      });
      setScreen("over");
    };

    const loop = () => {
      const s = stateRef.current;
      const W = s.width, H = s.height;

      // physics
      if (s.running) {
        s.birdVy += 0.32;
        if (s.birdVy > 9) s.birdVy = 9;
        s.birdY += s.birdVy;
        s.gates.forEach((g) => (g.x -= s.speed));

        // remove offscreen + spawn new
        if (s.gates.length && s.gates[0].x + GATE_WIDTH < -20) s.gates.shift();
        const last = s.gates[s.gates.length - 1];
        if (last && last.x < W - 280) spawnGate(W + 80);

        // boundaries
        if (s.birdY < BIRD_R || s.birdY > H - BIRD_R) gameOver();

        // collision / scoring
        const bx = W * 0.28;
        for (const g of s.gates) {
          const insideX = bx + BIRD_R > g.x && bx - BIRD_R < g.x + GATE_WIDTH;
          if (insideX) {
            const topBoxBottom = g.gapY - GAP / 2;
            const bottomBoxTop = g.gapY + GAP / 2;
            const topBoxTop = topBoxBottom - ANSWER_HEIGHT;
            const bottomBoxBottom = bottomBoxTop + ANSWER_HEIGHT;
            // hit top answer box?
            if (s.birdY - BIRD_R < topBoxBottom && s.birdY + BIRD_R > topBoxTop) {
              if (g.correctSide === "top" && !g.passed) {
                g.passed = true;
                s.score += 1;
                setScore(s.score);
                if (s.score % 5 === 0) s.speed = Math.min(s.speed + 0.25, 5.5);
                beep(880, 0.06, "triangle", 0.05);
              } else if (g.correctSide !== "top") {
                gameOver();
                break;
              }
            } else if (s.birdY + BIRD_R > bottomBoxTop && s.birdY - BIRD_R < bottomBoxBottom) {
              if (g.correctSide === "bottom" && !g.passed) {
                g.passed = true;
                s.score += 1;
                setScore(s.score);
                if (s.score % 5 === 0) s.speed = Math.min(s.speed + 0.25, 5.5);
                beep(880, 0.06, "triangle", 0.05);
              } else if (g.correctSide !== "bottom") {
                gameOver();
                break;
              }
            }
          }
        }
      }

      // draw
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, 0, W, H);

      // subtle grid
      ctx.strokeStyle = "rgba(120,255,220,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 24) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }

      // gates
      for (const g of s.gates) {
        const correctColor = "#39ff9d";
        const wrongColor = "#ff3d7f";
        const topIsCorrect = g.correctSide === "top";
        const topColor = topIsCorrect ? correctColor : wrongColor;
        const bottomColor = topIsCorrect ? wrongColor : correctColor;
        const topBoxBottom = g.gapY - GAP / 2;
        const bottomBoxTop = g.gapY + GAP / 2;

        // question label centered above the gate
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "600 14px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(g.question, g.x + GATE_WIDTH / 2, 30);

        // top box
        drawAnswerBox(ctx, g.x, topBoxBottom - ANSWER_HEIGHT, GATE_WIDTH, ANSWER_HEIGHT, topColor, g.topAnswer);
        // bottom box
        drawAnswerBox(ctx, g.x, bottomBoxTop, GATE_WIDTH, ANSWER_HEIGHT, bottomColor, g.bottomAnswer);
      }

      // bird (neon circle)
      const bx = W * 0.28;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#7df9ff";
      ctx.fillStyle = "#e6fbff";
      ctx.beginPath();
      ctx.arc(bx, s.birdY, BIRD_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // score
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "700 28px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(String(s.score), W / 2, 70);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [screen, spawnGate]);

  // Input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); flap(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#06060c] p-2 sm:p-4">
      <div
        className="relative w-full max-w-[440px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_60px_rgba(125,249,255,0.08)] bg-[#0a0a12] select-none"
        onPointerDown={(e) => { e.preventDefault(); flap(); }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {screen === "menu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center bg-[#06060c]/80 backdrop-blur-sm">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Flap<span className="text-[#39ff9d]">Quiz</span>
              </h1>
              <p className="mt-2 text-sm text-white/50">Tap to fly. Pick the right answer.</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              {([
                { id: "math", label: "Math" },
                { id: "vocab", label: "Vocabulary" },
                { id: "pattern", label: "Pattern Puzzles" },
              ] as { id: Mode; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={(e) => { e.stopPropagation(); startGame(m.id); }}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-[#39ff9d]/10 hover:border-[#39ff9d]/40 hover:text-[#39ff9d] transition-all"
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30">High Score: {highScore}</p>
          </div>
        )}

        {screen === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center bg-[#06060c]/80 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-[#ff3d7f]">Game Over</h2>
            <div className="text-white">
              <div className="text-5xl font-bold">{score}</div>
              <div className="text-xs text-white/50 mt-1">High: {highScore}</div>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <button
                onClick={(e) => { e.stopPropagation(); startGame(mode); }}
                className="w-full py-3 rounded-xl bg-[#39ff9d] text-black font-semibold hover:brightness-110 transition"
              >
                Play Again
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setScreen("menu"); }}
                className="w-full py-2 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm"
              >
                Change Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function drawAnswerBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, label: string,
) {
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = color + "22"; // hex with alpha — works for #rrggbb
  // fallback fill (in case of 4-char hex)
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 20px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2);
  ctx.textBaseline = "alphabetic";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
