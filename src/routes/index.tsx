import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export const Route = createFileRoute("/")({
  component: Game,
});

type Mode = "math" | "vocab" | "pattern";
type Question = { q: string; correct: string; wrong: string };
type Screen = "menu" | "play" | "over" | "progress" | "themes" | "missions";

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/* ----------------------------- Question Banks ----------------------------- */

function genMath(level: number): Question {
  const ops = level < 3 ? ["+", "-"] : level < 6 ? ["+", "-", "×"] : ["+", "-", "×"];
  const op = pick(ops);
  const max = Math.min(6 + level * 2, 20);
  let a = randInt(1, max), b = randInt(1, max), correct = 0;
  if (op === "+") correct = a + b;
  if (op === "-") { if (b > a) [a, b] = [b, a]; correct = a - b; }
  if (op === "×") { a = randInt(2, Math.min(5 + level, 12)); b = randInt(2, Math.min(5 + level, 12)); correct = a * b; }
  const drift = Math.max(2, Math.floor(correct * 0.15) + 2);
  let wrong = correct + (Math.random() < 0.5 ? -1 : 1) * randInt(1, drift);
  if (wrong === correct || wrong < 0) wrong = correct + drift + 1;
  return { q: `${a} ${op} ${b}`, correct: String(correct), wrong: String(wrong) };
}

const VOCAB_TIERS: { q: string; correct: string; wrong: string }[][] = [
  // Tier 0 — basics
  [
    { q: "Happy means…", correct: "Joyful", wrong: "Tired" },
    { q: "Big means…", correct: "Large", wrong: "Tiny" },
    { q: "Fast means…", correct: "Quick", wrong: "Slow" },
    { q: "Cold means…", correct: "Chilly", wrong: "Warm" },
    { q: "Begin means…", correct: "Start", wrong: "End" },
  ],
  // Tier 1
  [
    { q: "Smart means…", correct: "Clever", wrong: "Dull" },
    { q: "Brave means…", correct: "Bold", wrong: "Afraid" },
    { q: "Quiet means…", correct: "Silent", wrong: "Loud" },
    { q: "Rich means…", correct: "Wealthy", wrong: "Poor" },
    { q: "Tiny means…", correct: "Small", wrong: "Huge" },
  ],
  // Tier 2 — unlocked at level 3
  [
    { q: "Vivid means…", correct: "Bright", wrong: "Faded" },
    { q: "Eager means…", correct: "Keen", wrong: "Bored" },
    { q: "Stern means…", correct: "Strict", wrong: "Lax" },
    { q: "Frail means…", correct: "Weak", wrong: "Sturdy" },
  ],
  // Tier 3 — unlocked at level 6
  [
    { q: "Lucid means…", correct: "Clear", wrong: "Vague" },
    { q: "Candid means…", correct: "Honest", wrong: "Sly" },
    { q: "Austere means…", correct: "Plain", wrong: "Lavish" },
    { q: "Ephemeral means…", correct: "Fleeting", wrong: "Eternal" },
  ],
];

function genVocab(level: number): Question {
  const maxTier = Math.min(VOCAB_TIERS.length - 1, Math.floor(level / 3));
  const tier = randInt(0, maxTier);
  return pick(VOCAB_TIERS[tier]);
}

function genPattern(level: number): Question {
  const variant = level < 3 ? 0 : level < 6 ? randInt(0, 1) : randInt(0, 2);
  if (variant === 0) {
    const start = randInt(1, 9);
    const step = randInt(2, 5);
    const seq = [start, start + step, start + 2 * step];
    const correct = start + 3 * step;
    const wrong = correct + (Math.random() < 0.5 ? -step : step + 1);
    return { q: `${seq.join(", ")}, ?`, correct: String(correct), wrong: String(wrong === correct ? correct + 3 : wrong) };
  }
  if (variant === 1) {
    const start = randInt(2, 4);
    const ratio = randInt(2, 3);
    const seq = [start, start * ratio, start * ratio * ratio];
    const correct = start * ratio * ratio * ratio;
    const wrong = correct + pick([-start, start, ratio]);
    return { q: `${seq.join(", ")}, ?`, correct: String(correct), wrong: String(wrong) };
  }
  // Fibonacci-like
  const a = randInt(1, 5), b = randInt(2, 6);
  const c = a + b, d = b + c;
  const correct = c + d;
  const wrong = correct + pick([-2, -1, 1, 2, 3]);
  return { q: `${a}, ${b}, ${c}, ${d}, ?`, correct: String(correct), wrong: String(wrong) };
}

const genQuestion = (mode: Mode, level: number): Question =>
  mode === "math" ? genMath(level) : mode === "vocab" ? genVocab(level) : genPattern(level);

/* ----------------------------- Themes ----------------------------- */

type Theme = {
  id: string;
  name: string;
  bg: string;
  bgInner: string;
  accent: string; // bird color
  glow: string;
  primary: string; // CTA
  secondary: string;
  unlockLevel: number;
};

const THEMES: Theme[] = [
  { id: "neon",   name: "Neon",   bg: "#06060c", bgInner: "#0a0a12", accent: "#e6fbff", glow: "#7df9ff", primary: "#39ff9d", secondary: "#ff3d7f", unlockLevel: 1 },
  { id: "sunset", name: "Sunset", bg: "#0d0612", bgInner: "#160a1a", accent: "#fff0e6", glow: "#ff9f6b", primary: "#ffb347", secondary: "#ff5ea8", unlockLevel: 3 },
  { id: "forest", name: "Forest", bg: "#04100a", bgInner: "#081a12", accent: "#eaffe8", glow: "#7dffb0", primary: "#a3ff7d", secondary: "#5cf2c4", unlockLevel: 5 },
  { id: "violet", name: "Violet", bg: "#08051a", bgInner: "#0d0a26", accent: "#f3eaff", glow: "#b78dff", primary: "#c084ff", secondary: "#7ad7ff", unlockLevel: 8 },
  { id: "mono",   name: "Mono",   bg: "#050505", bgInner: "#0c0c0c", accent: "#ffffff", glow: "#cccccc", primary: "#ffffff", secondary: "#888888", unlockLevel: 12 },
];

/* ----------------------------- Storage / Progress ----------------------------- */

type SaveData = {
  xp: number;
  level: number;
  coins: number;
  highScores: { math: number; vocab: number; pattern: number };
  bestCombo: number;
  totalCorrect: number;
  totalRuns: number;
  themeId: string;
  unlockedThemes: string[];
  achievements: string[];
  lastPlayedDate: string;
  streak: number;
  dailyClaimedDate: string;
  dailyChallenge: { date: string; mode: Mode; goal: number; progress: number; claimed: boolean };
  sfxOn: boolean;
  musicOn: boolean;
};

const SAVE_KEY = "flapquiz-save-v2";

function defaultSave(): SaveData {
  return {
    xp: 0,
    level: 1,
    coins: 0,
    highScores: { math: 0, vocab: 0, pattern: 0 },
    bestCombo: 0,
    totalCorrect: 0,
    totalRuns: 0,
    themeId: "neon",
    unlockedThemes: ["neon"],
    achievements: [],
    lastPlayedDate: "",
    streak: 0,
    dailyClaimedDate: "",
    dailyChallenge: { date: "", mode: "math", goal: 10, progress: 0, claimed: false },
    sfxOn: true,
    musicOn: true,
  };
}

function loadSave(): SaveData {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch {
    return defaultSave();
  }
}

function persistSave(s: SaveData) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {}
}

const xpForLevel = (lvl: number) => 50 + (lvl - 1) * 40;
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ----------------------------- Achievements ----------------------------- */

const ACHIEVEMENTS: { id: string; name: string; desc: string; check: (s: SaveData) => boolean; reward: number }[] = [
  { id: "first_blood", name: "First Steps", desc: "Answer 1 question correctly", check: s => s.totalCorrect >= 1, reward: 10 },
  { id: "score_10",    name: "Warming Up",  desc: "Score 10 in a single run",    check: s => Math.max(s.highScores.math, s.highScores.vocab, s.highScores.pattern) >= 10, reward: 25 },
  { id: "score_25",    name: "On Fire",     desc: "Score 25 in a single run",    check: s => Math.max(s.highScores.math, s.highScores.vocab, s.highScores.pattern) >= 25, reward: 60 },
  { id: "combo_5",     name: "Combo x5",    desc: "Reach a 5x combo",            check: s => s.bestCombo >= 5, reward: 30 },
  { id: "combo_10",    name: "Unstoppable", desc: "Reach a 10x combo",           check: s => s.bestCombo >= 10, reward: 75 },
  { id: "level_5",     name: "Rising Star", desc: "Reach Level 5",               check: s => s.level >= 5, reward: 50 },
  { id: "level_10",    name: "Master Mind", desc: "Reach Level 10",              check: s => s.level >= 10, reward: 150 },
  { id: "streak_3",    name: "Hot Streak",  desc: "Play 3 days in a row",        check: s => s.streak >= 3, reward: 50 },
  { id: "streak_7",    name: "Devoted",     desc: "Play 7 days in a row",        check: s => s.streak >= 7, reward: 200 },
  { id: "scholar",     name: "Scholar",     desc: "Answer 100 total correctly",  check: s => s.totalCorrect >= 100, reward: 100 },
];

/* ----------------------------- Audio ----------------------------- */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicNodes: { osc1: OscillatorNode; osc2: OscillatorNode; lfo: OscillatorNode; lfoGain: GainNode } | null = null;
let sfxEnabled = true;
let musicEnabled = true;
let musicTargetVol = 0.06;

function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioCtx.destination);
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 1;
    sfxGain.connect(masterGain);
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(masterGain);
  } catch {}
  return audioCtx;
}

function beep(freq: number, dur = 0.08, type: OscillatorType = "sine", vol = 0.18) {
  if (!sfxEnabled) return;
  try {
    const ctx = ensureAudio();
    if (!ctx || !sfxGain) return;
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(sfxGain);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch {}
}
function chord(freqs: number[], dur = 0.2, type: OscillatorType = "triangle") {
  freqs.forEach((f, i) => setTimeout(() => beep(f, dur, type, 0.16), i * 40));
}
function haptic(ms = 10) {
  try { (navigator as any).vibrate?.(ms); } catch {}
}

function startMusic() {
  if (!musicEnabled) return;
  const ctx = ensureAudio();
  if (!ctx || !musicGain || musicNodes) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sine"; osc2.type = "triangle";
  osc1.frequency.value = 196; // G3
  osc2.frequency.value = 261.63; // C4
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.18;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 8;
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);
  osc1.connect(musicGain);
  osc2.connect(musicGain);
  osc1.start(); osc2.start(); lfo.start();
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(musicTargetVol, ctx.currentTime + 1.2);
  musicNodes = { osc1, osc2, lfo, lfoGain };
}
function stopMusic() {
  if (!audioCtx || !musicGain || !musicNodes) return;
  const t = audioCtx.currentTime;
  musicGain.gain.cancelScheduledValues(t);
  musicGain.gain.setValueAtTime(musicGain.gain.value, t);
  musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.4);
  const nodes = musicNodes;
  musicNodes = null;
  setTimeout(() => { try { nodes.osc1.stop(); nodes.osc2.stop(); nodes.lfo.stop(); } catch {} }, 500);
}
function duckMusic(amount = 0.4, ms = 220) {
  if (!audioCtx || !musicGain || !musicNodes) return;
  const t = audioCtx.currentTime;
  musicGain.gain.cancelScheduledValues(t);
  musicGain.gain.setValueAtTime(musicGain.gain.value, t);
  musicGain.gain.linearRampToValueAtTime(musicTargetVol * amount, t + 0.05);
  musicGain.gain.linearRampToValueAtTime(musicTargetVol, t + ms / 1000);
}
function setSfxEnabled(v: boolean) { sfxEnabled = v; }
function setMusicEnabled(v: boolean) {
  musicEnabled = v;
  if (!v) stopMusic();
}

/* ----------------------------- Game Constants ----------------------------- */

const GATE_WIDTH = 70;
const ANSWER_HEIGHT = 110;
const GAP = 64;
const BIRD_R = 12;

interface Gate {
  x: number;
  topAnswer: string;
  bottomAnswer: string;
  correctSide: "top" | "bottom";
  question: string;
  gapY: number;
  passed: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

/* ----------------------------- Component ----------------------------- */

function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("math");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [save, setSave] = useState<SaveData>(defaultSave());
  const [toast, setToast] = useState<string | null>(null);
  const [floatTexts, setFloatTexts] = useState<{ id: number; text: string; color: string }[]>([]);
  const [infoTab, setInfoTab] = useState<null | "about" | "privacy" | "terms" | "contact">(null);
  const floatId = useRef(0);

  const theme = useMemo(
    () => THEMES.find(t => t.id === save.themeId) || THEMES[0],
    [save.themeId]
  );

  // Mutable game state
  const stateRef = useRef({
    birdY: 0, birdVy: 0, birdRot: 0,
    gates: [] as Gate[],
    particles: [] as Particle[],
    speed: 2.4,
    width: 360, height: 640,
    running: false,
    mode: "math" as Mode,
    score: 0,
    combo: 0,
    runCorrect: 0,
    flashAlpha: 0,
    flashColor: "#39ff9d",
    shake: 0,
    theme: THEMES[0],
    level: 1,
  });

  /* ---- Init save + daily streak ---- */
  useEffect(() => {
    const s = loadSave();

    // Streak handling
    const today = todayStr();
    if (s.lastPlayedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (s.lastPlayedDate === yesterday) s.streak += 1;
      else if (s.lastPlayedDate !== "") s.streak = 1;
      else s.streak = 1;
      s.lastPlayedDate = today;
    }

    // Daily challenge
    if (s.dailyChallenge.date !== today) {
      const modes: Mode[] = ["math", "vocab", "pattern"];
      s.dailyChallenge = {
        date: today,
        mode: pick(modes),
        goal: 10 + Math.min(s.level, 10) * 2,
        progress: 0,
        claimed: false,
      };
    }

    persistSave(s);
    setSave(s);
  }, []);

  /* ---- Theme sync to canvas state ---- */
  useEffect(() => { stateRef.current.theme = theme; }, [theme]);

  /* ---- Audio settings sync ---- */
  useEffect(() => {
    setSfxEnabled(save.sfxOn);
    setMusicEnabled(save.musicOn);
    if (save.musicOn) startMusic(); else stopMusic();
  }, [save.sfxOn, save.musicOn]);

  /* ---- Pause music on tab/window blur ---- */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopMusic();
      else if (save.musicOn) startMusic();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", () => stopMusic());
    window.addEventListener("focus", () => { if (save.musicOn) startMusic(); });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [save.musicOn]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const checkAchievements = (s: SaveData): SaveData => {
    let updated = { ...s };
    let earned = 0;
    let names: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (!updated.achievements.includes(a.id) && a.check(updated)) {
        updated.achievements = [...updated.achievements, a.id];
        updated.coins += a.reward;
        earned += a.reward;
        names.push(a.name);
      }
    }
    if (names.length) {
      setTimeout(() => showToast(`★ ${names[0]} +${earned}c`), 400);
      chord([523, 659, 784], 0.15);
    }
    return updated;
  };

  const addFloatText = (text: string, color: string) => {
    const id = ++floatId.current;
    setFloatTexts(arr => [...arr, { id, text, color }]);
    setTimeout(() => setFloatTexts(arr => arr.filter(f => f.id !== id)), 900);
  };

  const spawnGate = useCallback((x: number) => {
    const s = stateRef.current;
    const q = genQuestion(s.mode, s.level);
    const correctTop = Math.random() < 0.5;
    const minY = 130;
    const maxY = s.height - 130;
    const gapY = randInt(minY, maxY);
    s.gates.push({
      x, gapY,
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
    s.birdRot = 0;
    s.gates = [];
    s.particles = [];
    s.speed = 2.4 + Math.min(save.level - 1, 5) * 0.1;
    s.score = 0;
    s.combo = 0;
    s.runCorrect = 0;
    s.flashAlpha = 0;
    s.shake = 0;
    setScore(0); setCombo(0);
    spawnGate(s.width + 100);
    spawnGate(s.width + 100 + 280);
    spawnGate(s.width + 100 + 560);
  }, [spawnGate, save.level]);

  const startGame = (m: Mode) => {
    setMode(m);
    stateRef.current.mode = m;
    stateRef.current.level = save.level;
    setScreen("play");
    requestAnimationFrame(() => {
      reset();
      stateRef.current.running = true;
    });
  };

  const flap = () => {
    const s = stateRef.current;
    if (!s.running) return;
    s.birdVy = -5.8;
    s.birdRot = -0.4;
    // flap particles
    for (let i = 0; i < 4; i++) {
      s.particles.push({
        x: s.width * 0.28 - 4, y: s.birdY,
        vx: -randInt(1, 3), vy: randInt(-1, 1),
        life: 0, maxLife: 22,
        color: theme.glow, size: randInt(2, 4),
      });
    }
    beep(680, 0.05, "square", 0.18);
    haptic(8);
  };

  /* ---- Game Loop ---- */
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
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const burst = (x: number, y: number, color: string, count = 16) => {
      const s = stateRef.current;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const sp = 1 + Math.random() * 3;
        s.particles.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 0, maxLife: 28 + Math.random() * 14,
          color, size: 2 + Math.random() * 3,
        });
      }
    };

    const gameOver = () => {
      const s = stateRef.current;
      s.running = false;
      s.shake = 16;
      burst(s.width * 0.28, s.birdY, theme.secondary, 30);
      beep(180, 0.32, "sawtooth", 0.28);
      haptic(40);
      const fin = s.score;
      setScore(fin);

      // Persist progress
      setSave(prev => {
        let next = { ...prev };
        next.totalRuns += 1;
        next.totalCorrect += s.runCorrect;
        next.bestCombo = Math.max(next.bestCombo, s.combo);
        next.highScores = { ...next.highScores };
        if (fin > (next.highScores as any)[s.mode]) (next.highScores as any)[s.mode] = fin;

        // XP & coins
        const xpGain = fin * 5 + s.runCorrect * 2;
        const coinGain = fin * 2;
        next.xp += xpGain;
        next.coins += coinGain;

        let leveledUp = false;
        while (next.xp >= xpForLevel(next.level)) {
          next.xp -= xpForLevel(next.level);
          next.level += 1;
          leveledUp = true;
        }

        // Daily challenge progress
        if (next.dailyChallenge.mode === s.mode && !next.dailyChallenge.claimed) {
          next.dailyChallenge.progress = Math.min(
            next.dailyChallenge.goal,
            next.dailyChallenge.progress + s.runCorrect
          );
        }

        // Theme unlocks
        for (const t of THEMES) {
          if (next.level >= t.unlockLevel && !next.unlockedThemes.includes(t.id)) {
            next.unlockedThemes = [...next.unlockedThemes, t.id];
            setTimeout(() => showToast(`Unlocked theme: ${t.name}`), 600);
          }
        }

        if (leveledUp) {
          setTimeout(() => showToast(`Level Up! Lv ${next.level}`), 200);
          chord([523, 659, 784, 1046], 0.18);
        }

        next = checkAchievements(next);
        persistSave(next);
        return next;
      });

      setTimeout(() => setScreen("over"), 700);
    };

    const onCorrect = (g: Gate, bx: number) => {
      const s = stateRef.current;
      g.passed = true;
      s.score += 1;
      s.combo += 1;
      s.runCorrect += 1;
      const bonus = s.combo >= 3 ? Math.floor(s.combo / 3) : 0;
      s.score += bonus;
      setScore(s.score);
      setCombo(s.combo);
      s.flashAlpha = 0.18;
      s.flashColor = theme.primary;
      // speed scales with score AND combo
      if (s.score % 5 === 0) s.speed = Math.min(s.speed + 0.22, 5.8);
      burst(bx, s.birdY, theme.primary, 14);
      addFloatText(bonus > 0 ? `+${1 + bonus} x${s.combo}` : `+1`, theme.primary);
      beep(740 + Math.min(s.combo, 8) * 40, 0.08, "triangle", 0.22);
      if (s.combo >= 3 && s.combo % 3 === 0) { chord([880, 1100, 1320], 0.12); duckMusic(0.35, 280); }
      haptic(6);
    };

    const loop = () => {
      const s = stateRef.current;
      const W = s.width, H = s.height;

      // physics
      if (s.running) {
        s.birdVy += 0.34;
        if (s.birdVy > 9.5) s.birdVy = 9.5;
        s.birdY += s.birdVy;
        s.birdRot = Math.max(-0.6, Math.min(1.1, s.birdVy * 0.08));
        s.gates.forEach((g) => (g.x -= s.speed));
        if (s.gates.length && s.gates[0].x + GATE_WIDTH < -20) s.gates.shift();
        const last = s.gates[s.gates.length - 1];
        if (last && last.x < W - 280) spawnGate(W + 80);

        if (s.birdY < BIRD_R || s.birdY > H - BIRD_R) { gameOver(); }

        const bx = W * 0.28;
        for (const g of s.gates) {
          const insideX = bx + BIRD_R > g.x && bx - BIRD_R < g.x + GATE_WIDTH;
          if (insideX) {
            const topBoxBottom = g.gapY - GAP / 2;
            const bottomBoxTop = g.gapY + GAP / 2;
            const topBoxTop = topBoxBottom - ANSWER_HEIGHT;
            const bottomBoxBottom = bottomBoxTop + ANSWER_HEIGHT;
            if (s.birdY - BIRD_R < topBoxBottom && s.birdY + BIRD_R > topBoxTop) {
              if (g.correctSide === "top" && !g.passed) onCorrect(g, bx);
              else if (g.correctSide !== "top") { gameOver(); break; }
            } else if (s.birdY + BIRD_R > bottomBoxTop && s.birdY - BIRD_R < bottomBoxBottom) {
              if (g.correctSide === "bottom" && !g.passed) onCorrect(g, bx);
              else if (g.correctSide !== "bottom") { gameOver(); break; }
            }
          }
        }
      }

      // particles
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life += 1;
      }
      s.particles = s.particles.filter(p => p.life < p.maxLife);

      // shake
      let sx = 0, sy = 0;
      if (s.shake > 0) {
        sx = (Math.random() - 0.5) * s.shake;
        sy = (Math.random() - 0.5) * s.shake;
        s.shake *= 0.85;
        if (s.shake < 0.5) s.shake = 0;
      }

      // draw
      ctx.save();
      ctx.translate(sx, sy);

      // bg
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, s.theme.bgInner);
      grad.addColorStop(1, s.theme.bg);
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, W + 40, H + 40);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 28) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let j = 0; j < H; j += 28) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
      }

      // gates
      const neutral = s.theme.glow;
      for (const g of s.gates) {
        const topBoxBottom = g.gapY - GAP / 2;
        const bottomBoxTop = g.gapY + GAP / 2;

        // Question label sits in a glass pill above the gap so it's never hidden behind the top HUD
        const qx = g.x + GATE_WIDTH / 2;
        const qy = Math.max(110, g.gapY - GAP / 2 - 28);
        ctx.font = "700 15px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        const qw = Math.max(ctx.measureText(g.question).width + 22, 64);
        const qh = 24;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        roundRect(ctx, qx - qw / 2, qy - qh / 2, qw, qh, 12);
        ctx.fill();
        ctx.strokeStyle = `${s.theme.glow}66`;
        ctx.lineWidth = 1;
        roundRect(ctx, qx - qw / 2, qy - qh / 2, qw, qh, 12);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.textBaseline = "middle";
        ctx.fillText(g.question, qx, qy + 1);
        ctx.textBaseline = "alphabetic";

        drawAnswerBox(ctx, g.x, topBoxBottom - ANSWER_HEIGHT, GATE_WIDTH, ANSWER_HEIGHT, neutral, g.topAnswer);
        drawAnswerBox(ctx, g.x, bottomBoxTop, GATE_WIDTH, ANSWER_HEIGHT, neutral, g.bottomAnswer);
      }

      // particles draw
      for (const p of s.particles) {
        const a = 1 - p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // bird
      const bx = W * 0.28;
      ctx.save();
      ctx.translate(bx, s.birdY);
      ctx.rotate(s.birdRot);
      ctx.shadowBlur = 22;
      ctx.shadowColor = s.theme.glow;
      ctx.fillStyle = s.theme.accent;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // eye
      ctx.fillStyle = s.theme.bg;
      ctx.beginPath();
      ctx.arc(4, -3, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // flash overlay
      if (s.flashAlpha > 0.005) {
        ctx.fillStyle = s.flashColor;
        ctx.globalAlpha = s.flashAlpha;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        s.flashAlpha *= 0.85;
      }

      // (Score + combo are rendered as React HUD overlays, not on canvas, to avoid overlap with question text.)

      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [screen, spawnGate, theme]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); flap(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  /* ---- Daily reward claim ---- */
  const claimDaily = () => {
    if (save.dailyClaimedDate === todayStr()) return;
    const reward = 20 + Math.min(save.streak, 7) * 10;
    const next = { ...save, coins: save.coins + reward, dailyClaimedDate: todayStr() };
    persistSave(next);
    setSave(next);
    showToast(`Daily reward: +${reward} coins`);
    chord([659, 784, 1046], 0.15);
    haptic(20);
  };

  const claimChallenge = () => {
    const dc = save.dailyChallenge;
    if (dc.claimed || dc.progress < dc.goal) return;
    const reward = 60 + save.level * 5;
    let next = { ...save, coins: save.coins + reward, dailyChallenge: { ...dc, claimed: true } };
    next = checkAchievements(next);
    persistSave(next);
    setSave(next);
    showToast(`Challenge complete: +${reward} coins`);
    chord([784, 1046, 1318], 0.18);
  };

  const selectTheme = (id: string) => {
    if (!save.unlockedThemes.includes(id)) return;
    const next = { ...save, themeId: id };
    persistSave(next);
    setSave(next);
    beep(880, 0.06, "triangle", 0.18);
  };

  const toggleSfx = () => {
    const next = { ...save, sfxOn: !save.sfxOn };
    persistSave(next); setSave(next);
    if (next.sfxOn) beep(880, 0.06, "triangle", 0.18);
  };
  const toggleMusic = () => {
    const next = { ...save, musicOn: !save.musicOn };
    persistSave(next); setSave(next);
  };

  const xpNeeded = xpForLevel(save.level);
  const xpPct = Math.min(100, (save.xp / xpNeeded) * 100);
  const dailyClaimed = save.dailyClaimedDate === todayStr();
  const challengeReady = save.dailyChallenge.progress >= save.dailyChallenge.goal && !save.dailyChallenge.claimed;

  /* ----------------------------- Render ----------------------------- */

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 transition-colors"
      style={{ background: `radial-gradient(ellipse at top, ${theme.bgInner}, ${theme.bg})` }}
    >
      <div
        className="relative w-full max-w-[440px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/10 select-none"
        style={{
          background: theme.bgInner,
          boxShadow: `0 0 80px ${theme.glow}22, 0 0 0 1px ${theme.glow}11 inset`,
        }}
        onPointerDown={(e) => { if (screen === "play") { e.preventDefault(); flap(); } }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* In-game floating texts */}
        {screen === "play" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {floatTexts.map(f => (
              <div
                key={f.id}
                className="absolute text-2xl font-black animate-[floatUp_900ms_ease-out_forwards]"
                style={{ color: f.color, textShadow: `0 0 12px ${f.color}` }}
              >
                {f.text}
              </div>
            ))}
          </div>
        )}

        {/* Compact top HUD bar in play (slim, never overlaps the question pill which sits ~110px down) */}
        {screen === "play" && (
          <>
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] pointer-events-none z-30">
              <div className="px-2 py-0.5 rounded-full bg-black/55 backdrop-blur border border-white/10 text-white/75 font-semibold">
                Lv {save.level}
              </div>
              <div
                className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur border text-white font-black text-sm tabular-nums leading-tight"
                style={{ borderColor: `${theme.primary}55`, boxShadow: `0 0 10px ${theme.primary}33` }}
              >
                {score}
              </div>
              <div className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur border border-white/10 text-white/75 font-semibold">
                🔥 {save.streak}
              </div>
            </div>
            {/* Combo popup floats near the bottom so it never covers the question pill */}
            {combo >= 2 && (
              <div
                key={combo}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black pointer-events-none animate-[comboPop_260ms_ease-out] z-30 whitespace-nowrap"
                style={{
                  background: `${theme.secondary}22`,
                  color: theme.secondary,
                  border: `1px solid ${theme.secondary}66`,
                  textShadow: `0 0 10px ${theme.secondary}`,
                  boxShadow: `0 0 18px ${theme.secondary}33`,
                }}
              >
                🔥 COMBO x{combo}
              </div>
            )}
          </>
        )}

        {/* MENU */}
        {screen === "menu" && (
          <MenuScreen
            theme={theme}
            save={save}
            xpPct={xpPct}
            xpNeeded={xpNeeded}
            dailyClaimed={dailyClaimed}
            challengeReady={challengeReady}
            onStart={startGame}
            onClaimDaily={claimDaily}
            onClaimChallenge={claimChallenge}
            onOpenThemes={() => setScreen("themes")}
            onOpenMissions={() => setScreen("missions")}
            onOpenProgress={() => setScreen("progress")}
            onToggleSfx={toggleSfx}
            onToggleMusic={toggleMusic}
          />
        )}

        {/* GAME OVER */}
        {screen === "over" && (
          <GameOverScreen
            theme={theme}
            save={save}
            score={score}
            combo={combo}
            mode={mode}
            xpPct={xpPct}
            xpNeeded={xpNeeded}
            onRetry={() => startGame(mode)}
            onMenu={() => setScreen("menu")}
          />
        )}

        {/* THEMES */}
        {screen === "themes" && (
          <ThemesScreen
            theme={theme}
            save={save}
            onSelect={selectTheme}
            onBack={() => setScreen("menu")}
          />
        )}

        {/* MISSIONS / ACHIEVEMENTS */}
        {screen === "missions" && (
          <MissionsScreen
            theme={theme}
            save={save}
            onBack={() => setScreen("menu")}
          />
        )}

        {/* PROGRESS */}
        {screen === "progress" && (
          <ProgressScreen
            theme={theme}
            save={save}
            xpPct={xpPct}
            xpNeeded={xpNeeded}
            onBack={() => setScreen("menu")}
          />
        )}

        {/* Toast */}
        {toast && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold animate-[fadeSlide_300ms_ease-out] pointer-events-none z-50"
            style={{
              background: `${theme.bg}cc`,
              color: theme.primary,
              border: `1px solid ${theme.primary}55`,
              boxShadow: `0 0 20px ${theme.primary}44`,
            }}
          >
            {toast}
          </div>
        )}

        {/* Info button (visible outside gameplay) */}
        {screen !== "play" && (
          <button
            onClick={(e) => { e.stopPropagation(); setInfoTab("about"); }}
            aria-label="About & legal"
            className="absolute top-3 right-3 z-40 w-9 h-9 rounded-full flex items-center justify-center text-white/80 border border-white/10 bg-black/40 backdrop-blur active:scale-95 transition"
          >
            <span className="text-sm font-bold">i</span>
          </button>
        )}

        {/* Info / Legal Modal */}
        {infoTab && (
          <InfoModal theme={theme} tab={infoTab} setTab={setInfoTab} onClose={() => setInfoTab(null)} />
        )}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes fadeSlide {
          0% { transform: translate(-50%, -10px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ambientRise {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          15%  { opacity: 0.6; }
          85%  { opacity: 0.4; }
          100% { transform: translate3d(0, -110%, 0); opacity: 0; }
        }
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--pulse, rgba(255,255,255,0)); }
          50%      { box-shadow: 0 0 24px 2px var(--pulse, rgba(255,255,255,0.35)); }
        }
        .pulse-glow { animation: softPulse 2.8s ease-in-out infinite; }
        @keyframes comboPop {
          0%   { transform: translate(-50%, 12px) scale(0.7); opacity: 0; }
          60%  { transform: translate(-50%, -2px) scale(1.08); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------- Sub-screens ----------------------------- */

function GlassCard({
  children, theme, className = "",
}: { children: React.ReactNode; theme: Theme; className?: string }) {
  return (
    <div
      className={`rounded-2xl border backdrop-blur-md ${className}`}
      style={{
        background: `linear-gradient(135deg, ${theme.glow}10, ${theme.primary}08)`,
        borderColor: `${theme.glow}22`,
      }}
    >
      {children}
    </div>
  );
}

function MenuScreen({
  theme, save, xpPct, xpNeeded, dailyClaimed, challengeReady,
  onStart, onClaimDaily, onClaimChallenge, onOpenThemes, onOpenMissions, onOpenProgress,
  onToggleSfx, onToggleMusic,
}: any) {
  const particles = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      left: (i * 73 + 11) % 100,
      delay: (i * 0.7) % 8,
      duration: 9 + ((i * 1.3) % 7),
      size: 2 + (i % 3),
    })),
    []
  );
  return (
    <div
      className="absolute inset-0 flex flex-col px-5 py-6 overflow-y-auto"
      style={{ background: `${theme.bgInner}f0`, animation: "scaleIn 250ms ease-out" }}
    >
      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: theme.glow,
              boxShadow: `0 0 8px ${theme.glow}`,
              opacity: 0.5,
              animation: `ambientRise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            MindRush<span style={{ color: theme.primary }}> IQ</span>
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Train your brain. Beat your best.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMusic?.(); }}
            aria-label={save.musicOn ? "Mute music" : "Enable music"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10 bg-white/5 active:scale-90 transition"
            style={{ color: save.musicOn ? theme.primary : "rgba(255,255,255,0.4)" }}
          >
            {save.musicOn ? "♪" : "♪̸"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSfx?.(); }}
            aria-label={save.sfxOn ? "Mute sound effects" : "Enable sound effects"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10 bg-white/5 active:scale-90 transition"
            style={{ color: save.sfxOn ? theme.primary : "rgba(255,255,255,0.4)" }}
          >
            {save.sfxOn ? "🔊" : "🔇"}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-xs text-white/70">◎</span>
            <span className="text-sm font-bold text-white">{save.coins}</span>
          </div>
        </div>
      </div>

      {/* Level / XP card */}
      <GlassCard theme={theme} className="p-3 mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-white">Level {save.level}</span>
          <span className="text-white/50">{save.xp} / {xpNeeded} XP</span>
        </div>
        <div className="h-2 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${xpPct}%`,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.glow})`,
              boxShadow: `0 0 12px ${theme.primary}`,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-white/50">
          <span>🔥 Streak: <span className="text-white font-semibold">{save.streak}</span></span>
          <span>🏆 Best: <span className="text-white font-semibold">{Math.max(save.highScores.math, save.highScores.vocab, save.highScores.pattern)}</span></span>
        </div>
      </GlassCard>

      {/* Daily rewards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          disabled={dailyClaimed}
          onClick={(e) => { e.stopPropagation(); onClaimDaily(); }}
          className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold border transition disabled:opacity-50"
          style={{
            background: dailyClaimed ? "rgba(255,255,255,0.04)" : `${theme.primary}18`,
            borderColor: dailyClaimed ? "rgba(255,255,255,0.08)" : `${theme.primary}55`,
            color: dailyClaimed ? "rgba(255,255,255,0.4)" : theme.primary,
          }}
        >
          <div>🎁 Daily Reward</div>
          <div className="text-[10px] opacity-70 mt-0.5">{dailyClaimed ? "Claimed" : `+${20 + Math.min(save.streak, 7) * 10} coins`}</div>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClaimChallenge(); }}
          disabled={!challengeReady}
          className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold border transition disabled:opacity-60"
          style={{
            background: challengeReady ? `${theme.secondary}18` : "rgba(255,255,255,0.04)",
            borderColor: challengeReady ? `${theme.secondary}66` : "rgba(255,255,255,0.08)",
            color: challengeReady ? theme.secondary : "rgba(255,255,255,0.55)",
          }}
        >
          <div>⚡ {save.dailyChallenge.mode.toUpperCase()} Challenge</div>
          <div className="text-[10px] opacity-70 mt-0.5">
            {save.dailyChallenge.claimed ? "Done" : `${save.dailyChallenge.progress}/${save.dailyChallenge.goal}`}
          </div>
        </button>
      </div>

      {/* Mode select */}
      <div className="text-[11px] uppercase tracking-widest text-white/40 mb-2 font-bold">Choose Mode</div>
      <div className="flex flex-col gap-2 mb-4">
        {([
          { id: "math", label: "Math", desc: "Solve equations", icon: "∑" },
          { id: "vocab", label: "Vocabulary", desc: "Match meanings", icon: "Aa" },
          { id: "pattern", label: "Patterns", desc: "Find the next", icon: "◐" },
        ] as { id: Mode; label: string; desc: string; icon: string }[]).map((m, idx) => (
          <button
            key={m.id}
            onClick={(e) => { e.stopPropagation(); onStart(m.id); }}
            className={`group relative w-full px-4 py-3.5 rounded-2xl border text-left flex items-center gap-3 transition active:scale-[0.98] hover:-translate-y-0.5 ${idx === 0 ? "pulse-glow" : ""}`}
            style={{
              background: `linear-gradient(135deg, ${theme.glow}14, ${theme.primary}0a)`,
              borderColor: `${theme.glow}3a`,
              ...(idx === 0 ? ({ ["--pulse" as any]: `${theme.primary}55` } as React.CSSProperties) : {}),
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
              style={{ background: `${theme.primary}22`, color: theme.primary }}
            >
              {m.icon}
            </div>
            <div className="flex-1">
              <div className="text-white font-bold">{m.label}</div>
              <div className="text-[11px] text-white/40">{m.desc}</div>
            </div>
            <div className="text-[10px] text-white/40">
              Best {(save.highScores as any)[m.id]}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <NavBtn theme={theme} label="Themes" onClick={onOpenThemes} />
        <NavBtn theme={theme} label="Missions" onClick={onOpenMissions} />
        <NavBtn theme={theme} label="Stats" onClick={onOpenProgress} />
      </div>
      <div className="mt-3 text-center text-[10px] text-white/35">
        © {new Date().getFullYear()} MindRush IQ · Tap the <span className="text-white/60">i</span> for Privacy, Terms & Contact
      </div>
    </div>
  );
}

function NavBtn({ theme, label, onClick }: { theme: Theme; label: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="py-2.5 rounded-xl text-xs font-semibold text-white/80 border border-white/10 bg-white/5 hover:text-white hover:border-white/20 transition active:scale-95"
      style={{ background: `${theme.glow}08` }}
    >
      {label}
    </button>
  );
}

const MOTIVATIONS = [
  "Sharp mind. Sharper next run.",
  "Every run trains your brain.",
  "You're getting faster.",
  "One more try — beat your best.",
  "Focus is a muscle. Keep flexing.",
  "Almost legendary. Go again.",
];

function GameOverScreen({ theme, save, score, combo, mode, xpPct, xpNeeded, onRetry, onMenu }: any) {
  const isHigh = score >= (save.highScores as any)[mode];
  const message = useMemo(
    () => (isHigh ? "Personal best unlocked!" : MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]),
    [score, isHigh]
  );
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: `${theme.bgInner}f0`, animation: "scaleIn 280ms ease-out" }}
    >
      <h2 className="text-2xl font-black" style={{ color: theme.secondary }}>
        {isHigh ? "★ NEW BEST" : "Game Over"}
      </h2>
      <div className="text-white">
        <div className="text-6xl font-black animate-[scaleIn_350ms_ease-out]" style={{ textShadow: `0 0 24px ${theme.glow}` }}>
          {score}
        </div>
        <div className="text-xs text-white/50 mt-1">
          Best Combo x{combo} • Earned {score * 5} XP
        </div>
        <div className="text-[11px] mt-2 italic" style={{ color: `${theme.primary}cc` }}>
          {message}
        </div>
      </div>

      <GlassCard theme={theme} className="w-full max-w-[260px] p-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-white">Level {save.level}</span>
          <span className="text-white/50">{save.xp} / {xpNeeded}</span>
        </div>
        <div className="h-2 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${xpPct}%`,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.glow})`,
            }}
          />
        </div>
      </GlassCard>

      <div className="flex flex-col gap-2 w-full max-w-[260px]">
        <button
          onClick={(e) => { e.stopPropagation(); onRetry(); }}
          className="w-full py-3.5 rounded-2xl font-black text-sm tracking-wide active:scale-[0.97] transition"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.glow})`,
            color: theme.bg,
            boxShadow: `0 8px 24px ${theme.primary}55`,
          }}
        >
          PLAY AGAIN
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMenu(); }}
          className="w-full py-2.5 rounded-2xl border border-white/10 text-white/70 hover:text-white text-xs font-semibold transition"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}

function ThemesScreen({ theme, save, onSelect, onBack }: any) {
  return (
    <div
      className="absolute inset-0 flex flex-col px-5 py-6 overflow-y-auto"
      style={{ background: `${theme.bgInner}f0`, animation: "scaleIn 250ms ease-out" }}
    >
      <Header theme={theme} title="Themes" onBack={onBack} />
      <div className="flex flex-col gap-2.5 mt-2">
        {THEMES.map(t => {
          const unlocked = save.unlockedThemes.includes(t.id);
          const active = save.themeId === t.id;
          return (
            <button
              key={t.id}
              disabled={!unlocked}
              onClick={(e) => { e.stopPropagation(); onSelect(t.id); }}
              className="rounded-2xl p-3 flex items-center gap-3 border transition active:scale-[0.98] disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${t.bgInner}, ${t.bg})`,
                borderColor: active ? t.primary : `${t.glow}33`,
                boxShadow: active ? `0 0 20px ${t.primary}55` : "none",
              }}
            >
              <div className="flex gap-1">
                <div className="w-6 h-10 rounded" style={{ background: t.primary, boxShadow: `0 0 10px ${t.primary}` }} />
                <div className="w-6 h-10 rounded" style={{ background: t.glow }} />
                <div className="w-6 h-10 rounded" style={{ background: t.secondary }} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-white">{t.name}</div>
                <div className="text-[11px] text-white/50">
                  {unlocked ? (active ? "Active" : "Tap to apply") : `Unlocks at Lv ${t.unlockLevel}`}
                </div>
              </div>
              {active && <div className="text-xs font-black" style={{ color: t.primary }}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MissionsScreen({ theme, save, onBack }: any) {
  return (
    <div
      className="absolute inset-0 flex flex-col px-5 py-6 overflow-y-auto"
      style={{ background: `${theme.bgInner}f0`, animation: "scaleIn 250ms ease-out" }}
    >
      <Header theme={theme} title="Missions" onBack={onBack} />

      {/* Daily challenge */}
      <GlassCard theme={theme} className="p-3 mb-3 mt-2">
        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Daily Challenge</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-bold capitalize">{save.dailyChallenge.mode} run</div>
            <div className="text-[11px] text-white/50">Answer {save.dailyChallenge.goal} correctly</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black" style={{ color: theme.primary }}>
              {save.dailyChallenge.progress}/{save.dailyChallenge.goal}
            </div>
            <div className="text-[10px] text-white/50">{save.dailyChallenge.claimed ? "Claimed" : "Reward: +" + (60 + save.level * 5)}</div>
          </div>
        </div>
      </GlassCard>

      <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 mt-1">Achievements</div>
      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map(a => {
          const done = save.achievements.includes(a.id);
          return (
            <div
              key={a.id}
              className="rounded-xl p-3 border flex items-center gap-3"
              style={{
                background: done ? `${theme.primary}15` : "rgba(255,255,255,0.03)",
                borderColor: done ? `${theme.primary}55` : "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                style={{
                  background: done ? theme.primary : "rgba(255,255,255,0.06)",
                  color: done ? theme.bg : "rgba(255,255,255,0.4)",
                }}
              >
                {done ? "✓" : "?"}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${done ? "text-white" : "text-white/60"}`}>{a.name}</div>
                <div className="text-[11px] text-white/40">{a.desc}</div>
              </div>
              <div className="text-[11px] font-bold" style={{ color: done ? theme.primary : "rgba(255,255,255,0.4)" }}>
                +{a.reward}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressScreen({ theme, save, xpPct, xpNeeded, onBack }: any) {
  const stat = (label: string, value: any) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
  return (
    <div
      className="absolute inset-0 flex flex-col px-5 py-6 overflow-y-auto"
      style={{ background: `${theme.bgInner}f0`, animation: "scaleIn 250ms ease-out" }}
    >
      <Header theme={theme} title="Stats" onBack={onBack} />

      <GlassCard theme={theme} className="p-4 mb-3 mt-2">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[11px] text-white/50 uppercase tracking-widest">Level</div>
            <div className="text-4xl font-black text-white">{save.level}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/50">XP</div>
            <div className="text-sm font-bold text-white">{save.xp} / {xpNeeded}</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${xpPct}%`,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.glow})`,
            }}
          />
        </div>
      </GlassCard>

      <GlassCard theme={theme} className="p-4">
        {stat("Coins", `◎ ${save.coins}`)}
        {stat("Daily Streak", `🔥 ${save.streak}`)}
        {stat("Best Combo", `x${save.bestCombo}`)}
        {stat("Total Correct", save.totalCorrect)}
        {stat("Runs Played", save.totalRuns)}
        {stat("Math High", save.highScores.math)}
        {stat("Vocab High", save.highScores.vocab)}
        {stat("Pattern High", save.highScores.pattern)}
        {stat("Achievements", `${save.achievements.length} / ${ACHIEVEMENTS.length}`)}
        {stat("Themes", `${save.unlockedThemes.length} / ${THEMES.length}`)}
      </GlassCard>
    </div>
  );
}

function Header({ theme, title, onBack }: { theme: Theme; title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <button
        onClick={(e) => { e.stopPropagation(); onBack(); }}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white border border-white/10 bg-white/5 active:scale-95 transition"
      >
        ←
      </button>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="ml-auto text-xs text-white/50">
        ◎ <span className="text-white font-bold">0</span>
      </div>
    </div>
  );
}

/* ----------------------------- Canvas Helpers ----------------------------- */

function drawAnswerBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, label: string,
) {
  ctx.shadowBlur = 16;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = color + "22";
  roundRect(ctx, x, y, w, h, 12);
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

/* ----------------------------- Info / Legal Modal ----------------------------- */

type InfoTab = "about" | "privacy" | "terms" | "contact";

const SUPPORT_EMAIL = "vishvajeet9717kumar@gmail.com";

function InfoModal({
  theme, tab, setTab, onClose,
}: {
  theme: Theme;
  tab: InfoTab;
  setTab: (t: InfoTab) => void;
  onClose: () => void;
}) {
  const tabs: { id: InfoTab; label: string }[] = [
    { id: "about", label: "About" },
    { id: "privacy", label: "Privacy" },
    { id: "terms", label: "Terms" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <div
      className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center p-3"
      style={{ background: "rgba(0,0,0,0.65)", animation: "fadeSlide 200ms ease-out" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          background: theme.bgInner,
          borderColor: `${theme.glow}33`,
          boxShadow: `0 20px 60px ${theme.glow}33`,
          maxHeight: "85%",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="text-white font-black tracking-tight">
            MindRush<span style={{ color: theme.primary }}> IQ</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 border border-white/10 bg-white/5 active:scale-95 transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 pt-3">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 py-2 rounded-xl text-[11px] font-bold transition border"
                style={{
                  background: active ? `${theme.primary}22` : "rgba(255,255,255,0.03)",
                  borderColor: active ? `${theme.primary}66` : "rgba(255,255,255,0.08)",
                  color: active ? theme.primary : "rgba(255,255,255,0.6)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-4 py-4 overflow-y-auto text-white/75 text-[13px] leading-relaxed">
          {tab === "about" && (
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base">About MindRush IQ</h3>
              <p>MindRush IQ is a fast, modern brain-training game designed to make daily mental practice fun and rewarding.</p>
              <p>Train and improve:</p>
              <ul className="list-disc list-inside space-y-0.5 text-white/70">
                <li>Focus & attention</li>
                <li>Working memory</li>
                <li>Pattern recognition</li>
                <li>Thinking speed</li>
                <li>Problem-solving skills</li>
              </ul>
              <p className="text-white/55 text-xs pt-2">Designed to be safe, simple, and parent-friendly for players of all ages.</p>
            </div>
          )}

          {tab === "privacy" && (
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base">Privacy Policy</h3>
              <p>MindRush IQ may collect:</p>
              <ul className="list-disc list-inside space-y-0.5 text-white/70">
                <li>Device information</li>
                <li>Browser type</li>
                <li>Gameplay analytics</li>
                <li>Crash & performance data</li>
                <li>Ad interaction data</li>
              </ul>
              <p>This data may be used to improve gameplay, fix bugs, strengthen security, analyze performance, and display ads.</p>
              <p>We may use third-party services such as Google AdSense, Google AdMob, and Firebase Analytics.</p>
              <p className="text-white/60 text-xs">Contact: <span className="text-white">{SUPPORT_EMAIL}</span></p>
            </div>
          )}

          {tab === "terms" && (
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base">Terms & Conditions</h3>
              <p>By playing MindRush IQ, you agree not to:</p>
              <ul className="list-disc list-inside space-y-0.5 text-white/70">
                <li>Copy or resell the game</li>
                <li>Reverse engineer any systems</li>
                <li>Use hacks, cheats, or bots</li>
                <li>Abuse bugs or exploits</li>
              </ul>
              <p>The game may contain advertisements and reward-based ads. We may update or modify the game at any time without prior notice.</p>
              <p className="text-white/60 text-xs">Contact: <span className="text-white">{SUPPORT_EMAIL}</span></p>
            </div>
          )}

          {tab === "contact" && (
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base">Contact Us</h3>
              <p>Need help, have feedback, or want to report a bug?</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-block mt-1 px-3 py-2 rounded-xl text-sm font-bold"
                style={{
                  background: `${theme.primary}22`,
                  color: theme.primary,
                  border: `1px solid ${theme.primary}55`,
                }}
              >
                ✉ {SUPPORT_EMAIL}
              </a>
              <p className="text-white/55 text-xs pt-2">Typical response time: 24–72 hours.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5 text-center text-[10px] text-white/40">
          © {new Date().getFullYear()} MindRush IQ — All rights reserved.
        </div>
      </div>
    </div>
  );
}
